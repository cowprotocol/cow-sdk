import { cowAppDataLatestScheme as latestAppData } from '@cowprotocol/sdk-app-data'

import {
  BridgeDeposit,
  BridgeHook,
  HookBridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
} from '../../types'

import {
  DEFAULT_EXTRA_GAS_FOR_HOOK_ESTIMATION,
  HOOK_DAPP_BRIDGE_PROVIDER_PREFIX,
  RAW_PROVIDERS_FILES_PATH,
} from '../../const'

import { AcrossApi, AcrossApiOptions } from './AcrossApi'
import { mapAcrossStatusToBridgeStatus, toBridgeQuoteResult } from './util'
import { createAcrossDepositCall } from './createAcrossDepositCall'
import { SuggestedFeesResponse } from './types'
import { getDepositParams } from './getDepositParams'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { getGasLimitEstimationForHook } from '../utils/getGasLimitEstimationForHook'
import {
  AbstractProviderAdapter,
  getAddressKey,
  getGlobalAdapter,
  getWrappedNativeToken,
  isNativeToken,
  isWrappedNativeToken,
  setGlobalAdapter,
  SignerLike,
} from '@cowprotocol/sdk-common'
import {
  arbitrumOne,
  base,
  bnb,
  ChainId,
  ChainInfo,
  EvmCall,
  getChainInfo,
  ink,
  mainnet,
  optimism,
  polygon,
  SupportedChainId,
  TokenInfo,
} from '@cowprotocol/sdk-config'
import { CowShedSdk, CowShedSdkOptions } from '@cowprotocol/sdk-cow-shed'
import { EnrichedOrder, OrderKind } from '@cowprotocol/sdk-order-book'

type SupportedTokensState = Record<ChainId, Record<string, TokenInfo>>

export const ACROSS_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/across`
export const ACROSS_SUPPORTED_NETWORKS = [mainnet, polygon, arbitrumOne, base, optimism, bnb, ink]

// We need to review if we should set an additional slippage tolerance, for now assuming the quote gives you the exact price of bridging and no further slippage is needed
const SLIPPAGE_TOLERANCE_BPS = 0

export interface AcrossBridgeProviderOptions {
  // API options
  apiOptions?: AcrossApiOptions

  // Cow-shed options
  cowShedOptions?: CowShedSdkOptions
}

export interface AcrossQuoteResult extends BridgeQuoteResult {
  suggestedFees: SuggestedFeesResponse
}

const providerType = 'HookBridgeProvider' as const

export class AcrossBridgeProvider implements HookBridgeProvider<AcrossQuoteResult> {
  type = providerType
  protected api: AcrossApi
  protected cowShedSdk: CowShedSdk

  private supportedTokens: SupportedTokensState | null = null

  constructor(options: AcrossBridgeProviderOptions = {}, _adapter?: AbstractProviderAdapter) {
    const adapter = _adapter || options.cowShedOptions?.adapter
    if (adapter) {
      setGlobalAdapter(adapter)
    }
    this.api = new AcrossApi(options.apiOptions)
    this.cowShedSdk = new CowShedSdk(adapter, options.cowShedOptions?.factoryOptions)
  }

  info: BridgeProviderInfo = {
    name: 'Across',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/across/across-logo.png`,
    dappId: ACROSS_HOOK_DAPP_ID,
    website: 'https://across.to',
    type: providerType,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return ACROSS_SUPPORTED_NETWORKS
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    const tokens = Object.values((await this.getSupportedTokensState())[params.buyChainId] || {})
    const isRouteAvailable = tokens.length > 0

    return {
      tokens,
      isRouteAvailable,
    }
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    if (request.kind !== OrderKind.SELL) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED, { kind: request.kind })
    }

    // Currently, Across provider is only involved to cross-chains swaps via EOA
    const isTraderEOA = true
    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request

    const supportedTokensState = await this.getSupportedTokensState()
    const sourceTokens = supportedTokensState[sellTokenChainId]
    const sourceNativeToken = getChainInfo(sellTokenChainId)?.nativeCurrency

    /**
     * It should not be possible, just a technical check
     */
    if (!sourceTokens || !sourceNativeToken) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, { sellTokenChainId })
    }

    const buyToken = { address: buyTokenAddress, chainId: buyTokenChainId }
    const isBuyTokenNative = isNativeToken(buyToken)
    const isBuyTokenWrappedNative = isWrappedNativeToken(buyToken)

    const destinationToken = isBuyTokenNative ? getWrappedNativeToken(buyTokenChainId)?.address : buyTokenAddress
    const routes = await this.api.getAvailableRoutes({
      originChainId: sellTokenChainId,
      destinationChainId: buyTokenChainId,
      // Across uses wrapped native token address for both native and wrapped tokens
      ...(destinationToken ? { destinationToken: destinationToken } : null),
    })

    return routes.reduce<TokenInfo[]>((acc, route) => {
      // Across uses wrapped native token address for both native and wrapped tokens
      const intermediateToken = route.isNative
        ? sourceTokens[getAddressKey(sourceNativeToken.address)]
        : sourceTokens[getAddressKey(route.originToken)]

      if (!intermediateToken) return acc

      const isTokenNative = isNativeToken(intermediateToken)
      const isTokenWrappedNative = isWrappedNativeToken(intermediateToken)

      // https://docs.across.to/introduction/technical-faq#what-is-the-behavior-of-eth-weth-in-transfers
      if (isTraderEOA && isTokenWrappedNative) return acc
      if (!isTraderEOA && isTokenNative) return acc
      /**
       * It's not possible to mix NATIVE and WRAPPED tokens in a single deposit (e.g. ETH and WETH)
       * Input and output must be the same type (ETH/ETH or WETH/WETH)
       */
      // No ETH->WETH
      if (isBuyTokenNative && isTokenWrappedNative) return acc
      // No WETH->ETH
      if (isBuyTokenWrappedNative && isTokenNative) return acc

      acc.push(intermediateToken)

      return acc
    }, [])
  }

  async getQuote(request: QuoteBridgeRequest): Promise<AcrossQuoteResult> {
    const { sellTokenAddress, sellTokenChainId, buyTokenAddress, buyTokenChainId, amount, receiver } = request

    const suggestedFees = await this.api.getSuggestedFees({
      inputToken: sellTokenAddress,
      outputToken: buyTokenAddress,
      originChainId: sellTokenChainId,
      destinationChainId: buyTokenChainId,
      amount,
      recipient: receiver ?? undefined,
    })

    return toBridgeQuoteResult(request, SLIPPAGE_TOLERANCE_BPS, suggestedFees)
  }

  // Keyed by the EvmCall object reference returned from getUnsignedBridgeCall.
  // getBridgeSignedHook always passes that exact object into getSignedHook, so the reference
  // is a guaranteed-unique, collision-free correlator between the two calls — unlike calldata,
  // which can be identical for concurrent requests with the same parameters.
  // WeakMap allows GC to reclaim entries if getSignedHook is never called.
  private _pendingBridgeCalls = new WeakMap<EvmCall, EvmCall[]>()

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: AcrossQuoteResult): Promise<EvmCall> {
    const calls = createAcrossDepositCall({
      request,
      quote,
      cowShedSdk: this.cowShedSdk,
    })

    const lastCall = calls[calls.length - 1]
    if (!lastCall) throw new Error('No bridge calls generated')

    this._pendingBridgeCalls.set(lastCall, calls)

    return lastCall
  }

  async getGasLimitEstimationForHook(request: QuoteBridgeRequest): Promise<number> {
    // The Across swapAndBridge flow involves three USDC proxy calls (approve + 2x transferFrom),
    // each hitting a reentrancy sentry SSTORE (~20k gas) in the implementation. On chains like
    // Arbitrum with native USDC (proxy pattern), this exhausts the base 240k gas estimate.
    return getGasLimitEstimationForHook({
      cowShedSdk: this.cowShedSdk,
      request,
      extraGas: DEFAULT_EXTRA_GAS_FOR_HOOK_ESTIMATION,
    })
  }

  async getSignedHook(
    chainId: SupportedChainId,
    unsignedCall: EvmCall,
    bridgeHookNonce: string,
    deadline: bigint,
    hookGasLimit: number,
    signer?: SignerLike,
  ): Promise<BridgeHook> {
    // Retrieve the full set of calls (approve + swapAndBridge) stored for this exact unsignedCall
    // object. The reference is unique even when two concurrent requests have identical calldata.
    // Fall back to the single call so getSignedHook remains usable if called in isolation.
    const pendingCalls = this._pendingBridgeCalls.get(unsignedCall) ?? [unsignedCall]
    this._pendingBridgeCalls.delete(unsignedCall)

    // These are regular calls (not delegate calls) since the periphery expects to pull tokens
    // from cow-shed via transferFrom.
    const calls = pendingCalls.map((call) => ({
      target: call.to,
      value: call.value,
      callData: call.data,
      allowFailure: false,
      isDelegateCall: false,
    }))

    const { signedMulticall, cowShedAccount, gasLimit } = await this.cowShedSdk.signCalls({
      calls,
      chainId,
      signer,
      gasLimit: BigInt(hookGasLimit),
      deadline,
      nonce: bridgeHookNonce,
    })

    const { to, data } = signedMulticall
    return {
      postHook: {
        target: to,
        callData: data,
        gasLimit: gasLimit.toString(),
        dappId: ACROSS_HOOK_DAPP_ID,
      },
      recipient: cowShedAccount,
    }
  }

  async decodeBridgeHook(_hook: latestAppData.CoWHook): Promise<BridgeDeposit> {
    throw new Error('Not implemented')
  }

  async getBridgingParams(
    chainId: ChainId,
    order: EnrichedOrder,
    txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    const adapter = getGlobalAdapter()

    const txReceipt = await adapter.getTransactionReceipt(txHash)

    if (!txReceipt) return null

    const params = await getDepositParams(chainId, order, txReceipt)

    if (!params) return null

    return {
      params,
      status: await this.getStatus(params.bridgingId, chainId),
    }
  }

  getExplorerUrl(_: string, tradeTxHash: string): string {
    return `https://app.across.to/transaction/${tradeTxHash}`
  }

  async getStatus(bridgingId: string, originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    const depositStatus = await this.api.getDepositStatus({
      originChainId: originChainId.toString(),
      depositId: bridgingId,
    })

    return {
      status: mapAcrossStatusToBridgeStatus(depositStatus.status),
      depositTxHash: depositStatus.depositTxHash,
      fillTxHash: depositStatus.fillTx,
    }
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  private async getSupportedTokensState(): Promise<SupportedTokensState> {
    if (!this.supportedTokens) {
      const supportedTokens = (await this.api.getSupportedTokens()).reduce((acc, val) => {
        const data = acc[val.chainId] || {}

        data[getAddressKey(val.address)] = val

        acc[val.chainId] = data

        return acc
      }, {} as SupportedTokensState)

      this.supportedTokens = supportedTokens

      return supportedTokens
    }

    return this.supportedTokens
  }
}
