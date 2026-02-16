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

import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX, RAW_PROVIDERS_FILES_PATH } from '../../const'

import { AcrossApi, AcrossApiOptions } from './AcrossApi'
import { mapAcrossStatusToBridgeStatus, toBridgeQuoteResult } from './util'
import { createAcrossDepositCall } from './createAcrossDepositCall'
import { SuggestedFeesResponse } from './types'
import { getDepositParams } from './getDepositParams'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { getGasLimitEstimationForHook } from '../utils/getGasLimitEstimationForHook'
import { AbstractProviderAdapter, getGlobalAdapter, setGlobalAdapter, SignerLike } from '@cowprotocol/sdk-common'
import {
  arbitrumOne,
  base,
  ChainId,
  ChainInfo,
  isEvmChain,
  EvmCall,
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
export const ACROSS_SUPPORTED_NETWORKS = [mainnet, polygon, arbitrumOne, base, optimism]

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

    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request

    const supportedTokensState = await this.getSupportedTokensState()
    const buyTokenAddressLower = buyTokenAddress.toLowerCase()

    const sourceTokens = supportedTokensState[sellTokenChainId]
    const targetTokens = supportedTokensState[buyTokenChainId]

    // Find the token symbol for the target token
    const targetTokenSymbol = targetTokens && targetTokens[buyTokenAddressLower]?.symbol?.toLowerCase()
    if (!targetTokenSymbol) return []

    // Use the tokenSymbol to find the outputToken in the target chain
    return Object.values(sourceTokens || {}).filter((token) => token.symbol?.toLowerCase() === targetTokenSymbol)
  }

  async getQuote(request: QuoteBridgeRequest): Promise<AcrossQuoteResult> {
    const { sellTokenAddress, sellTokenChainId, buyTokenChainId, amount, receiver } = request

    const suggestedFees = await this.api.getSuggestedFees({
      token: sellTokenAddress,
      // inputToken: sellTokenAddress,
      // outputToken: buyTokenAddress,
      originChainId: sellTokenChainId,
      destinationChainId: buyTokenChainId,
      amount,
      recipient: receiver ?? undefined,
    })

    // TODO: The suggested fees contain way more information. As we review more bridge providers we should revisit the
    // facade of the quote result.
    //
    // For example, this contains also information on the limits, so you don't need to quote again for the same pair.
    // potentially, this could be cached for a short period of time in the SDK so we can resolve quotes with less
    // requests.

    return toBridgeQuoteResult(request, SLIPPAGE_TOLERANCE_BPS, suggestedFees)
  }

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: AcrossQuoteResult): Promise<EvmCall> {
    return createAcrossDepositCall({
      request,
      quote,
      cowShedSdk: this.cowShedSdk,
    })
  }

  async getGasLimitEstimationForHook(request: QuoteBridgeRequest): Promise<number> {
    return getGasLimitEstimationForHook({
      cowShedSdk: this.cowShedSdk,
      request,
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
    // Sign the multicall
    const { signedMulticall, cowShedAccount, gasLimit } = await this.cowShedSdk.signCalls({
      calls: [
        {
          target: unsignedCall.to,
          value: unsignedCall.value,
          callData: unsignedCall.data,
          allowFailure: false,
          isDelegateCall: true,
        },
      ],
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
        dappId: ACROSS_HOOK_DAPP_ID, // TODO: I think we should have some additional parameter to type the hook (using dappId for now)
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
    if (!isEvmChain(chainId)) {
      return null
    }

    const orderUid = order.uid
    const adapter = getGlobalAdapter()

    const txReceipt = await adapter.getTransactionReceipt(txHash)

    if (!txReceipt) return null

    const params = await getDepositParams(chainId, orderUid, txReceipt)

    if (!params) return null

    return {
      params,
      status: await this.getStatus(params.bridgingId, chainId),
    }
  }

  getExplorerUrl(_: string): string {
    return `https://app.across.to/transactions`
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

        data[val.address.toLowerCase()] = val

        acc[val.chainId] = data

        return acc
      }, {} as SupportedTokensState)

      this.supportedTokens = supportedTokens

      return supportedTokens
    }

    return this.supportedTokens
  }
}
