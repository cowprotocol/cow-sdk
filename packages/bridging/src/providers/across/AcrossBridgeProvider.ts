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
  DEFAULT_BRIDGE_SLIPPAGE_BPS,
  DEFAULT_EXTRA_GAS_FOR_HOOK_ESTIMATION,
  HOOK_DAPP_BRIDGE_PROVIDER_PREFIX,
  RAW_PROVIDERS_FILES_PATH,
} from '../../const'

import { AcrossApi, AcrossApiOptions } from './AcrossApi'
import { mapAcrossStatusToBridgeStatus, mapNativeOrWrappedTokenAddress, toBridgeQuoteResult } from './util'
import { createAcrossDepositCall, fetchAcrossSwapProxyAddress } from './createAcrossDepositCall'
import { SuggestedFeesResponse } from './types'
import { getDepositParams } from './getDepositParams'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { assertUnsignedBridgeCallsLength } from '../../utils/assertUnsignedBridgeCallsLength'
import { getGasLimitEstimationForHook } from '../utils/getGasLimitEstimationForHook'
import {
  AbstractProviderAdapter,
  getAddressKey,
  getGlobalAdapter,
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
  isSupportedChain,
  AddressPerChain,
} from '@cowprotocol/sdk-config'
import { CowShedSdk, CowShedSdkOptions } from '@cowprotocol/sdk-cow-shed'
import { EnrichedOrder, OrderKind } from '@cowprotocol/sdk-order-book'

type SupportedTokensState = Record<ChainId, Record<string, TokenInfo>>

export const ACROSS_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/across`
export const ACROSS_SUPPORTED_NETWORKS = [mainnet, polygon, arbitrumOne, base, optimism, bnb, ink]

// Currently, Across provider is only involved to cross-chains swaps via EOA
const isTraderEOA = true

export interface AcrossBridgeProviderOptions {
  // API options
  apiOptions?: AcrossApiOptions

  // Cow-shed options
  cowShedOptions?: CowShedSdkOptions

  /**
   * Return how much intermediate token to move from the CoW Shed to Across SwapProxy before
   * `swapAndBridge`. Must be >= `request.amount` (the amount used for `/suggested-fees`).
   *
   * Use this when the trading layer knows the executed intermediate balance (surplus) and can
   * pass it into hook calldata. If omitted, we prefund exactly `request.amount`, so the surplus
   * will not be bridged.
   */
  getPrefundFromShedIntermediateTokenAmount?: (request: QuoteBridgeRequest) => bigint
}

export interface AcrossQuoteResult extends BridgeQuoteResult {
  suggestedFees: SuggestedFeesResponse
}

const providerType = 'HookBridgeProvider' as const

export class AcrossBridgeProvider implements HookBridgeProvider<AcrossQuoteResult> {
  /** Prefund SwapProxy, then `swapAndBridge` on periphery. */
  readonly unsignedBridgeHookCallsCount = 2

  type = providerType
  protected api: AcrossApi
  protected cowShedSdk: CowShedSdk

  private supportedTokens: SupportedTokensState | null = null

  private readonly getPrefundFromShedIntermediateTokenAmount?: (request: QuoteBridgeRequest) => bigint

  constructor(options: AcrossBridgeProviderOptions = {}, _adapter?: AbstractProviderAdapter) {
    const adapter = _adapter || options.cowShedOptions?.adapter
    if (adapter) {
      setGlobalAdapter(adapter)
    }
    this.api = new AcrossApi(options.apiOptions)
    this.cowShedSdk = new CowShedSdk(adapter, options.cowShedOptions?.factoryOptions)
    this.getPrefundFromShedIntermediateTokenAmount = options.getPrefundFromShedIntermediateTokenAmount
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
    const tokens = Object.values((await this.getSupportedTokensState())[params.buyChainId] || {}).filter((token) => {
      // WETH is not supported as destination token
      // See https://docs.across.to/introduction/technical-faq#what-is-the-behavior-of-eth-weth-in-transfers
      if (isTraderEOA && isWrappedNativeToken(token)) return false

      return true
    })
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
    const destinationToken = mapNativeOrWrappedTokenAddress(buyToken)

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

      // https://docs.across.to/introduction/technical-faq#what-is-the-behavior-of-eth-weth-in-transfers
      // For EOA's, only WETH is supported as intermediate
      if (isTraderEOA && isTokenNative) return acc

      acc.push(intermediateToken)

      return acc
    }, [])
  }

  async getQuote(request: QuoteBridgeRequest): Promise<AcrossQuoteResult> {
    const { sellTokenAddress, sellTokenChainId, buyTokenAddress, buyTokenChainId, amount, receiver } = request
    const sellTokenLike = { chainId: sellTokenChainId, address: sellTokenAddress }

    if (isTraderEOA && isNativeToken(sellTokenLike)) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, {
        info: 'Across does not support native token deposit for EOA',
      })
    }

    const suggestedFees = await this.api.getSuggestedFees({
      inputToken: mapNativeOrWrappedTokenAddress(sellTokenLike),
      outputToken: mapNativeOrWrappedTokenAddress({ chainId: buyTokenChainId, address: buyTokenAddress }),
      originChainId: sellTokenChainId,
      destinationChainId: buyTokenChainId,
      amount,
      recipient: receiver ?? undefined,
    })

    return toBridgeQuoteResult(request, DEFAULT_BRIDGE_SLIPPAGE_BPS, suggestedFees)
  }

  async getUnsignedBridgeCalls(
    request: QuoteBridgeRequest,
    quote: AcrossQuoteResult,
  ): Promise<readonly [EvmCall, EvmCall]> {
    // Periphery hosts SwapProxy address for ERC20.transfer:
    const swapProxyAddress = await fetchAcrossSwapProxyAddress(request.sellTokenChainId)

    const prefundFromShedAmount =
      this.getPrefundFromShedIntermediateTokenAmount?.(request) ?? undefined

    // This same validation happens inside createAcrossDepositCall in case no custom `prefundFromShedAmount`
    // was used here:
    if (prefundFromShedAmount !== undefined && prefundFromShedAmount < request.amount) {
      throw new Error(
        'getPrefundFromShedIntermediateTokenAmount must return a value >= request.amount (Across min input)',
      )
    }

    const calls = createAcrossDepositCall({
      request,
      quote,
      cowShedSdk: this.cowShedSdk,
      swapProxyAddress,
      prefundFromShedAmount,
    })

    assertUnsignedBridgeCallsLength(calls, this.unsignedBridgeHookCallsCount, 'AcrossBridgeProvider.getUnsignedBridgeCalls')

    return calls
  }

  async getGasLimitEstimationForHook(request: QuoteBridgeRequest): Promise<number> {
    // The Across swapAndBridge flow involves three USDC proxy calls (cow-shed ERC20.transfer to SwapProxy + 2x transferFrom),
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
    unsignedCalls: readonly EvmCall[],
    bridgeHookNonce: string,
    deadline: bigint,
    hookGasLimit: number,
    signer?: SignerLike,
  ): Promise<BridgeHook> {
    assertUnsignedBridgeCallsLength(unsignedCalls, this.unsignedBridgeHookCallsCount, 'AcrossBridgeProvider.getSignedHook')

    // These are regular calls (not delegate calls) from cow-shed:
    // - First prefunds Across `SwapProxy`
    // - Second calls the periphery.

    const calls = unsignedCalls.map((call) => ({
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
    settlementContractOverride?: Partial<AddressPerChain>,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    if (!isSupportedChain(chainId)) {
      return null
    }

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
