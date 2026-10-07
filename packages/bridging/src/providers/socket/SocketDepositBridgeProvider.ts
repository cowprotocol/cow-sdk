import { EnrichedOrder, OrderKind } from '@cowprotocol/sdk-order-book'
import {
  ALL_CHAINS_MAP,
  ChainId,
  ChainInfo,
  EvmCall,
  SupportedChainId,
  TokenInfo,
} from '@cowprotocol/sdk-config'
import {
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatus,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
  ReceiverAccountBridgeProvider,
} from '../../types'
import { DEFAULT_BRIDGE_SLIPPAGE_BPS, RAW_PROVIDERS_FILES_PATH } from '../../const'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { SocketApi } from './SocketApi'
import { SOCKET_BASE_URL, SOCKET_HOOK_DAPP_ID } from './const'
import { SocketApiOptions, SocketQuoteRoute } from './types'
import {
  adaptSocketToken,
  mapSocketChains,
  selectBestDepositRoute,
  SOCKET_STATUS_TO_COW_STATUS,
  toBridgeQuoteResult,
} from './util'

export interface SocketDepositQuoteResult extends BridgeQuoteResult {
  depositAddress: string
  socketRoute: SocketQuoteRoute
}

export interface SocketDepositBridgeProviderOptions {
  apiOptions?: SocketApiOptions
}

const providerType = 'ReceiverAccountBridgeProvider' as const

export class SocketDepositBridgeProvider implements ReceiverAccountBridgeProvider<SocketDepositQuoteResult> {
  type = providerType

  protected api: SocketApi

  info: BridgeProviderInfo = {
    name: 'Socket',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/bungee/bungee-logo.png`,
    dappId: SOCKET_HOOK_DAPP_ID,
    website: 'https://socket.tech',
    type: providerType,
  }

  constructor(private options: SocketDepositBridgeProviderOptions = {}) {
    this.api = new SocketApi(options.apiOptions)
  }

  async getNetworks(): Promise<ChainInfo[]> {
    const tokens = await this.api.getTokens(Object.keys(ALL_CHAINS_MAP).map(Number))
    const chainIds = [...new Set(tokens.map((token) => token.chainId))]
    return mapSocketChains(chainIds)
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    const tokens = (await this.api.getTokens([params.buyChainId])).map(adaptSocketToken)

    return {
      tokens,
      isRouteAvailable: tokens.length > 0,
    }
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    if (request.kind !== OrderKind.SELL) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED, { kind: request.kind })
    }

    const [sourceTokens, targetTokens] = await Promise.all([
      this.api.getTokens([request.sellTokenChainId]),
      this.api.getTokens([request.buyTokenChainId]),
    ])

    const isTargetTokenSupported = targetTokens.some(
      (token) => token.address.toLowerCase() === request.buyTokenAddress.toLowerCase(),
    )

    return isTargetTokenSupported ? sourceTokens.map(adaptSocketToken) : []
  }

  async getQuote(request: QuoteBridgeRequest): Promise<SocketDepositQuoteResult> {
    const {
      amount,
      account,
      owner,
      receiver,
      bridgeRecipient,
      sellTokenAddress,
      sellTokenChainId,
      buyTokenAddress,
      buyTokenChainId,
      bridgeSlippageBps,
    } = request

    const refundAddress = owner ?? account
    const quote = await this.api.getQuote({
      userOps: 'deposit',
      originChainId: sellTokenChainId.toString(),
      destinationChainId: buyTokenChainId.toString(),
      inputToken: sellTokenAddress,
      inputAmount: amount.toString(),
      outputToken: buyTokenAddress,
      receiverAddress: bridgeRecipient || receiver || account,
      userAddress: refundAddress,
      refundAddress,
      slippage: bpsToPercentString(bridgeSlippageBps ?? DEFAULT_BRIDGE_SLIPPAGE_BPS),
      includeProvider: this.options.apiOptions?.includeProvider?.join(','),
      excludeProvider: this.options.apiOptions?.excludeProvider?.join(','),
    })

    const route = selectBestDepositRoute(quote.result.routes)
    if (!route?.deposit?.depositAddress) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, quote)
    }

    return toBridgeQuoteResult(request, route)
  }

  async getBridgeReceiverOverride(_request: QuoteBridgeRequest, quote: SocketDepositQuoteResult): Promise<string> {
    return quote.depositAddress
  }

  async getBridgingParams(
    _chainId: ChainId,
    order: EnrichedOrder,
    _txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    const quoteId = getQuoteIdFromOrder(order)
    if (!quoteId) return null

    const status = await this.api.getStatus(quoteId)
    const result = status.result
    const originInput = result.origin?.input?.[0]
    const destinationOutput = result.destination?.output?.[0]

    if (!originInput || !destinationOutput || !result.origin || !result.destination) {
      return null
    }

    const statusResult = toStatusResult(result.status, result.origin.txHash, result.destination.txHash)

    return {
      status: statusResult,
      params: {
        inputTokenAddress: originInput.token.address,
        outputTokenAddress: destinationOutput.token.address,
        inputAmount: BigInt(originInput.amount),
        outputAmount: destinationOutput.amount ? BigInt(destinationOutput.amount) : null,
        owner: order.owner,
        quoteTimestamp: null,
        fillDeadline: null,
        recipient: result.destination.receiverAddress || order.owner,
        sourceChainId: result.origin.chainId,
        destinationChainId: result.destination.chainId,
        bridgingId: quoteId,
      },
    }
  }

  getExplorerUrl(bridgingId: string): string {
    return `${SOCKET_BASE_URL}/v3/swap/status?quoteId=${bridgingId}`
  }

  async getStatus(bridgingId: string, _originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    try {
      const response = await this.api.getStatus(bridgingId)
      return toStatusResult(response.result.status, response.result.origin?.txHash, response.result.destination?.txHash)
    } catch {
      return {
        status: BridgeStatus.UNKNOWN,
      }
    }
  }

  getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
}

function bpsToPercentString(bps: number): string {
  return (bps / 100).toString()
}

function getQuoteIdFromOrder(order: EnrichedOrder): string | undefined {
  if (!order.fullAppData) return undefined

  try {
    const appData = JSON.parse(order.fullAppData)
    return appData?.metadata?.bridging?.quoteId
  } catch {
    return undefined
  }
}

function toStatusResult(status: string, depositTxHash?: string | null, fillTxHash?: string | null): BridgeStatusResult {
  return {
    status: SOCKET_STATUS_TO_COW_STATUS[status as keyof typeof SOCKET_STATUS_TO_COW_STATUS] ?? BridgeStatus.UNKNOWN,
    depositTxHash: depositTxHash || undefined,
    fillTxHash: fillTxHash || undefined,
  }
}
