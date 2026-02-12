import { cowAppDataLatestScheme as latestAppData } from '@cowprotocol/sdk-app-data'
import { EnrichedOrder, OrderKind } from '@cowprotocol/sdk-order-book'

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
  DEFAULT_EXTRA_GAS_PROXY_CREATION,
  RAW_PROVIDERS_FILES_PATH,
} from '../../const'
import { BungeeApi } from './BungeeApi'
import { toBridgeQuoteResult } from './util'
import { createBungeeDepositCall } from './createBungeeDepositCall'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from './const/misc'
import { BungeeApiOptions, BungeeBuildTx, BungeeQuote, BungeeQuoteAPIRequest } from './types'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { getGasLimitEstimationForHook } from '../utils/getGasLimitEstimationForHook'
import { getBridgingStatusFromEvents } from './getBridgingStatusFromEvents'
import {
  ALL_CHAINS_MAP,
  arbitrumOne,
  avalanche,
  base,
  ChainId,
  ChainInfo,
  EvmCall,
  gnosisChain,
  mainnet,
  optimism,
  polygon,
  SupportedEvmChainId,
  TokenInfo,
} from '@cowprotocol/sdk-config'
import { CowShedSdk, CowShedSdkOptions } from '@cowprotocol/sdk-cow-shed'
import { AbstractProviderAdapter, setGlobalAdapter, SignerLike } from '@cowprotocol/sdk-common'

export const BUNGEE_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/bungee`
export const BUNGEE_SUPPORTED_NETWORKS = [mainnet, polygon, arbitrumOne, base, optimism, avalanche, gnosisChain]

/** There will be no dex swaps happening while bridging. Hence slippage will be zero */
const SLIPPAGE_TOLERANCE_BPS = 0

export interface BungeeBridgeProviderOptions {
  // API options
  apiOptions?: BungeeApiOptions

  // Cow-shed options
  cowShedOptions?: CowShedSdkOptions
}

export interface BungeeQuoteResult extends BridgeQuoteResult {
  bungeeQuote: BungeeQuote
  buildTx: BungeeBuildTx
}

const providerType = 'HookBridgeProvider' as const

export class BungeeBridgeProvider implements HookBridgeProvider<BungeeQuoteResult> {
  type = providerType

  protected api: BungeeApi
  protected cowShedSdk: CowShedSdk

  constructor(
    private options: BungeeBridgeProviderOptions,
    _adapter?: AbstractProviderAdapter,
  ) {
    const adapter = _adapter || options.cowShedOptions?.adapter
    if (adapter) {
      setGlobalAdapter(adapter)
    }

    this.api = new BungeeApi(options.apiOptions)
    this.cowShedSdk = new CowShedSdk(adapter, options.cowShedOptions?.factoryOptions)
  }

  info: BridgeProviderInfo = {
    name: 'Bungee',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/bungee/bungee-logo.png`,
    dappId: BUNGEE_HOOK_DAPP_ID,
    website: 'https://www.bungee.exchange',
    type: providerType,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return BUNGEE_SUPPORTED_NETWORKS
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    const tokens = await this.api.getBuyTokens(params)
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

    return this.api.getIntermediateTokens({
      fromChainId: request.sellTokenChainId,
      toChainId: request.buyTokenChainId,
      toTokenAddress: request.buyTokenAddress,
    })
  }

  async getQuote(request: QuoteBridgeRequest): Promise<BungeeQuoteResult> {
    // @note sellTokenAddress here will be the intermediate token in usage. the naming might be a bit misleading
    //       see getQuoteWithBridge.ts::getBaseBridgeQuoteRequest()
    const { sellTokenAddress, sellTokenChainId, buyTokenChainId, buyTokenAddress, amount, receiver, account, owner } =
      request

    // @note bungee api requires the sender address. sender address would be the cowshed account
    // fetch the cowshed account
    const ownerAddress = owner ?? account
    const cowshedAccount = this.cowShedSdk.getCowShedAccount(sellTokenChainId, ownerAddress)

    // fetch quote from bungee api
    const bungeeQuoteRequest: BungeeQuoteAPIRequest = {
      userAddress: cowshedAccount,
      originChainId: sellTokenChainId.toString(),
      destinationChainId: buyTokenChainId.toString(),
      inputToken: sellTokenAddress, // use intermediate token for the bridging quote
      inputAmount: amount.toString(),
      receiverAddress: receiver ?? account, // receiver is required on bungee api
      outputToken: buyTokenAddress,
      includeBridges: this.options.apiOptions?.includeBridges,
      enableManual: true,
      disableSwapping: true,
      disableAuto: true,
    }
    const quoteWithBuildTx = await this.api.getBungeeQuoteWithBuildTx(bungeeQuoteRequest)

    // verify build-tx data
    const isBuildTxValid = await this.api.verifyBungeeBuildTx(quoteWithBuildTx.bungeeQuote, quoteWithBuildTx.buildTx)

    if (!isBuildTxValid) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.TX_BUILD_ERROR, quoteWithBuildTx)
    }

    // convert bungee quote response to BridgeQuoteResult
    return toBridgeQuoteResult(request, SLIPPAGE_TOLERANCE_BPS, quoteWithBuildTx)
  }

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: BungeeQuoteResult): Promise<EvmCall> {
    return createBungeeDepositCall({
      request,
      quote,
    })
  }

  async getGasLimitEstimationForHook(request: QuoteBridgeRequest): Promise<number> {
    const isExtraGasRequired = this.isExtraGasRequired(request)
    const extraGas = isExtraGasRequired ? DEFAULT_EXTRA_GAS_FOR_HOOK_ESTIMATION : undefined
    const extraGasProxyCreation = isExtraGasRequired ? DEFAULT_EXTRA_GAS_PROXY_CREATION : undefined

    return getGasLimitEstimationForHook({
      cowShedSdk: this.cowShedSdk,
      request,
      extraGas,
      extraGasProxyCreation,
    })
  }

  async getSignedHook(
    chainId: SupportedEvmChainId,
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
        dappId: BUNGEE_HOOK_DAPP_ID,
      },
      recipient: cowShedAccount,
    }
  }

  async getBridgingParams(
    _chainId: ChainId,
    order: EnrichedOrder,
    _txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    const orderId = order.uid
    const events = await this.api.getEvents({ orderId })
    const event = events?.[0]

    if (!event) return null

    const status = await getBridgingStatusFromEvents(events, (orderId) => this.api.getAcrossStatus(orderId))

    const params: BridgingDepositParams = {
      inputTokenAddress: event.srcTokenAddress,
      outputTokenAddress: event.destTokenAddress,
      inputAmount: BigInt(event.srcAmount),
      outputAmount: event.destAmount ? BigInt(event.destAmount) : null,
      owner: event.sender,
      quoteTimestamp: null,
      fillDeadline: null,
      recipient: event.recipient,
      sourceChainId: event.fromChainId,
      destinationChainId: event.toChainId,
      bridgingId: orderId,
    }

    return { params, status }
  }

  async decodeBridgeHook(_hook: latestAppData.CoWHook): Promise<BridgeDeposit> {
    // Decoding the full quote from just hook calldata is quite hard right now
    // This will need more context and thus changes to either the hook calldata or the function interface
    // Can revisit once the approach is decided
    throw new Error('Not implemented')
  }

  getExplorerUrl(bridgingId: string): string {
    return `https://socketscan.io/tx/${bridgingId}`
  }

  async getStatus(_bridgingId: string): Promise<BridgeStatusResult> {
    // fetch indexed event from api
    const events = await this.api.getEvents({ orderId: _bridgingId })

    return getBridgingStatusFromEvents(events, (orderId) => this.api.getAcrossStatus(orderId))
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    // Support for cancellation will depend on the actual bridge an order went through.
    // Across & CCTP doesn't support cancellation.
    // Therefore, not implementing cancellation
    throw new Error('Not implemented')
  }

  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    // Support for refund will depend on the actual bridge an order went through.
    // CCTP doesn't support refund.
    // Across auto-relays refund txns some time after the order expires. No user action needed.
    // Therefore, not implementing refund
    throw new Error('Not implemented')
  }

  private isExtraGasRequired(request: QuoteBridgeRequest): boolean {
    const { sellTokenChainId, buyTokenChainId } = request

    // Bungee requires extra gas for bridging from Mainnet to Gnosis
    return sellTokenChainId === SupportedEvmChainId.MAINNET && buyTokenChainId === SupportedEvmChainId.GNOSIS_CHAIN
  }
}
