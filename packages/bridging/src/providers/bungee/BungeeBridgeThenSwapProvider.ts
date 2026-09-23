import { EnrichedOrder, OrderKind } from '@cowprotocol/sdk-order-book'
import {
  BridgeThenSwapProvider,
  BridgeThenSwapTransaction,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  DestinationOrderParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
} from '../../types'
import { RAW_PROVIDERS_FILES_PATH } from '../../const'
import { BungeeApi } from './BungeeApi'
import { toBridgeQuoteResult } from './util'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from './const/misc'
import { BungeeApiOptions, BungeeQuote, BungeeBuildTx, BungeeQuoteAPIRequest } from './types'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { getBridgingStatusFromEvents } from './getBridgingStatusFromEvents'
import { computeOrderFlowAddress } from './bridgeThenSwap/computeOrderFlowAddress'
import { encodeOrderData } from './bridgeThenSwap/encodeOrderData'
import {
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
  SupportedChainId,
  TargetChainId,
  TokenInfo,
} from '@cowprotocol/sdk-config'
import { AbstractProviderAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'

export const BUNGEE_BRIDGE_THEN_SWAP_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/bungee-bridge-then-swap`
export const BUNGEE_BRIDGE_THEN_SWAP_SUPPORTED_NETWORKS = [
  mainnet,
  polygon,
  arbitrumOne,
  base,
  optimism,
  avalanche,
  gnosisChain,
]

/** No dex swaps happening on the bridge side. Slippage is zero for the bridge leg. */
const SLIPPAGE_TOLERANCE_BPS = 0

/** Estimated gas for OrderFlowFactory.executeData + OrderFlow.createOrder */
const DEFAULT_DESTINATION_GAS_ESTIMATE = 500_000

export interface BungeeBridgeThenSwapProviderOptions {
  /** Bungee API options */
  apiOptions?: BungeeApiOptions

  /**
   * OrderFlowFactory contract addresses per destination chain.
   * Required: at least one destination chain must be configured.
   */
  orderFlowFactoryAddresses: Partial<Record<SupportedChainId, string>>

  /**
   * The keccak256 hash of the OrderFlow contract init code.
   * Used for CREATE2 address computation.
   */
  orderFlowInitCodeHash: string
}

export interface BungeeBridgeThenSwapQuoteResult extends BridgeQuoteResult {
  bungeeQuote: BungeeQuote
  buildTx: BungeeBuildTx
}

const providerType = 'BridgeThenSwapProvider' as const

export class BungeeBridgeThenSwapProvider implements BridgeThenSwapProvider<BungeeBridgeThenSwapQuoteResult> {
  type = providerType

  protected api: BungeeApi

  constructor(
    private options: BungeeBridgeThenSwapProviderOptions,
    _adapter?: AbstractProviderAdapter,
  ) {
    if (_adapter) {
      setGlobalAdapter(_adapter)
    }

    this.api = new BungeeApi(options.apiOptions)
  }

  info: BridgeProviderInfo = {
    name: 'Bungee Bridge & Swap',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/bungee/bungee-logo.png`,
    dappId: BUNGEE_BRIDGE_THEN_SWAP_DAPP_ID,
    website: 'https://www.bungee.exchange',
    type: providerType,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return BUNGEE_BRIDGE_THEN_SWAP_SUPPORTED_NETWORKS
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

    // For bridge-then-swap, intermediate tokens are tokens that can be bridged
    // from the source chain to the destination chain (where the swap will happen)
    return this.api.getIntermediateTokens({
      fromChainId: request.sellTokenChainId,
      toChainId: request.buyTokenChainId,
      toTokenAddress: request.buyTokenAddress,
    })
  }

  async getQuote(request: QuoteBridgeRequest): Promise<BungeeBridgeThenSwapQuoteResult> {
    const { sellTokenAddress, sellTokenChainId, buyTokenChainId, buyTokenAddress, amount, receiver, account, owner } =
      request

    const senderAddress = owner ?? account ?? receiver
    if (!senderAddress) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.QUOTE_ERROR, {
        error: 'User address is required for bridge-then-swap quotes',
      })
    }

    const factoryAddress = this.getFactoryAddress(buyTokenChainId)

    const bungeeQuoteRequest: BungeeQuoteAPIRequest = {
      userAddress: senderAddress,
      originChainId: sellTokenChainId.toString(),
      destinationChainId: buyTokenChainId.toString(),
      inputToken: sellTokenAddress,
      inputAmount: amount.toString(),
      receiverAddress: factoryAddress,
      outputToken: buyTokenAddress,
      includeBridges: this.options.apiOptions?.includeBridges,
      enableManual: true,
      disableSwapping: true,
      disableAuto: true,
    }

    const quoteWithBuildTx = await this.api.getBungeeQuoteWithBuildTx(bungeeQuoteRequest)

    // Verify build-tx data
    const isBuildTxValid = await this.api.verifyBungeeBuildTx(quoteWithBuildTx.bungeeQuote, quoteWithBuildTx.buildTx)

    if (!isBuildTxValid) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.TX_BUILD_ERROR, quoteWithBuildTx)
    }

    return toBridgeQuoteResult(
      request,
      SLIPPAGE_TOLERANCE_BPS,
      quoteWithBuildTx,
    ) as BungeeBridgeThenSwapQuoteResult
  }

  getOrderFlowAddress(owner: string, destinationChainId: TargetChainId): string {
    const factoryAddress = this.getFactoryAddress(destinationChainId)
    return computeOrderFlowAddress(factoryAddress, owner, this.options.orderFlowInitCodeHash)
  }

  encodeDestinationOrderData(params: DestinationOrderParams): string {
    return encodeOrderData(params)
  }

  async getDestinationGasLimit(_params: DestinationOrderParams): Promise<number> {
    // Return a conservative estimate. This covers:
    // - Bungee receiver contract overhead (30k is added by the caller)
    // - OrderFlowFactory.executeData: token transfer + CREATE2 deploy (if needed) + order creation
    // - OrderFlow.createOrder: EIP1271 signature setup + OrderPlacement event emission
    return DEFAULT_DESTINATION_GAS_ESTIMATE
  }

  async getBridgeTransaction(params: {
    bridgeQuote: BungeeBridgeThenSwapQuoteResult
    destinationPayload: string
    destinationGasLimit: number
  }): Promise<BridgeThenSwapTransaction> {
    const { bridgeQuote } = params
    const { buildTx } = bridgeQuote

    // The build-tx from Bungee already contains the bridge transaction.
    // For destination execution, we need to re-request with the destination payload.
    // However, since the quote was already obtained with the factory as receiver,
    // we use the build-tx directly. The destination payload is included in the
    // Bungee quote request params (destinationPayload, destinationGasLimit).
    return {
      to: buildTx.txData.to,
      data: buildTx.txData.data,
      value: buildTx.txData.value,
      chainId: buildTx.txData.chainId,
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

  getExplorerUrl(bridgingId: string): string {
    return `https://socketscan.io/tx/${bridgingId}`
  }

  async getStatus(_bridgingId: string): Promise<BridgeStatusResult> {
    const events = await this.api.getEvents({ orderId: _bridgingId })

    return getBridgingStatusFromEvents(events, (orderId) => this.api.getAcrossStatus(orderId))
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  /**
   * Get the OrderFlowFactory address for a destination chain.
   * Throws if no factory is configured for that chain.
   */
  private getFactoryAddress(chainId: TargetChainId): string {
    const address = this.options.orderFlowFactoryAddresses[chainId as SupportedChainId]

    if (!address) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.QUOTE_ERROR, {
        error: `No OrderFlowFactory address configured for chain ${chainId}`,
      })
    }

    return address
  }
}
