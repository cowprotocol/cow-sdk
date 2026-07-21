import { OrderKind } from '@cowprotocol/sdk-order-book'

import { DEFAULT_BRIDGE_SLIPPAGE_BPS, RAW_PROVIDERS_FILES_PATH } from '../../const'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { BridgeStatus } from '../../types'
import { RelayApi } from './RelayApi'
import {
  RELAY_HOOK_DAPP_ID,
  RELAY_STATUS_TO_COW_STATUS,
  RELAY_SUPPORTED_CHAIN_IDS,
  RELAY_SUPPORTED_NETWORKS,
} from './const'
import { computeFeeBps, computeFeeInBuyCurrency, computeSlippageBps, fromRelayAddress, mapRelayCurrencyToTokenInfo, toRelayAddress } from './util'

import type { RelayQuoteResponse } from './types'

import type { ChainId, ChainInfo, EvmCall, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import type { EnrichedOrder } from '@cowprotocol/sdk-order-book'
import type {
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
  ReceiverAccountBridgeProvider,
} from '../../types'

const providerType = 'ReceiverAccountBridgeProvider' as const

export interface RelayQuoteResult extends BridgeQuoteResult {
  requestId: string
  depositAddress: string
  timeEstimate: number
}

export interface RelayBridgeProviderOptions {
  baseUrl?: string
  apiKey?: string
}

export class RelayBridgeProvider implements ReceiverAccountBridgeProvider<RelayQuoteResult> {
  type = providerType

  protected api: RelayApi

  info: BridgeProviderInfo = {
    name: 'Relay',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/relay/relay-logo.png`,
    dappId: RELAY_HOOK_DAPP_ID,
    website: 'https://relay.link',
    type: providerType,
  }

  constructor(options?: RelayBridgeProviderOptions) {
    this.api = new RelayApi(options?.baseUrl, options?.apiKey)
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return RELAY_SUPPORTED_NETWORKS
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    if (!RELAY_SUPPORTED_CHAIN_IDS.has(params.buyChainId as number)) {
      return { tokens: [], isRouteAvailable: false }
    }

    const currencies = await this.api.getCurrencies({
      chainIds: [params.buyChainId as number],
      depositAddressOnly: true,
    })

    const tokens = currencies.map(mapRelayCurrencyToTokenInfo)
    return { tokens, isRouteAvailable: tokens.length > 0 }
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    if (request.kind !== OrderKind.SELL) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED, { kind: request.kind })
    }

    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request

    const [sourceCurrencies, destCurrencies] = await Promise.all([
      this.api.getCurrencies({ chainIds: [sellTokenChainId], depositAddressOnly: true }),
      this.api.getCurrencies({ chainIds: [buyTokenChainId as number], depositAddressOnly: true }),
    ])

    const destAddresses = new Set(destCurrencies.map((c) => c.address.toLowerCase()))

    if (!destAddresses.has(toRelayAddress(buyTokenAddress).toLowerCase())) {
      return []
    }

    return sourceCurrencies.map(mapRelayCurrencyToTokenInfo)
  }

  async getQuote(request: QuoteBridgeRequest): Promise<RelayQuoteResult> {
    if (request.kind !== OrderKind.SELL) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED, { kind: request.kind })
    }

    const { sellTokenAddress, sellTokenChainId, buyTokenAddress, buyTokenChainId, amount, owner, account, receiver } =
      request

    const relayResponse = await this.api.getQuote({
      user: owner ?? account,
      recipient: receiver ?? account,
      originChainId: sellTokenChainId,
      destinationChainId: buyTokenChainId as number,
      originCurrency: toRelayAddress(sellTokenAddress),
      destinationCurrency: toRelayAddress(buyTokenAddress),
      amount: amount.toString(),
      tradeType: 'EXACT_INPUT',
      useDepositAddress: true,
      strict: true,
      refundTo: owner ?? account,
      slippageTolerance: (request.bridgeSlippageBps ?? DEFAULT_BRIDGE_SLIPPAGE_BPS).toString(),
    })

    const step = relayResponse.steps[0]
    if (!step?.depositAddress) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES)
    }

    const { details, fees } = relayResponse
    const requestId = step.requestId

    return {
      id: requestId,
      requestId,
      depositAddress: step.depositAddress,
      timeEstimate: details.timeEstimate,
      quoteBody: JSON.stringify(relayResponse),
      isSell: request.kind === OrderKind.SELL,
      quoteTimestamp: Math.floor(Date.now() / 1000),
      expectedFillTimeSeconds: details.timeEstimate,
      limits: {
        minDeposit: BigInt(details.currencyIn.minimumAmount ?? details.currencyIn.amount),
        maxDeposit: BigInt(details.currencyIn.amount),
      },
      fees: {
        bridgeFee: BigInt(fees.relayer.amount),
        destinationGasFee: BigInt(fees.relayerGas.amount),
      },
      amountsAndCosts: {
        beforeFee: {
          sellAmount: BigInt(details.currencyIn.amount),
          buyAmount: BigInt(details.currencyOut.amount),
        },
        afterFee: {
          sellAmount: BigInt(details.currencyIn.amount),
          buyAmount: BigInt(details.currencyOut.minimumAmount ?? details.currencyOut.amount),
        },
        afterSlippage: {
          sellAmount: BigInt(details.currencyIn.amount),
          buyAmount: BigInt(details.currencyOut.minimumAmount ?? details.currencyOut.amount),
        },
        slippageBps: computeSlippageBps(details),
        costs: {
          bridgingFee: {
            feeBps: computeFeeBps(details, fees),
            amountInSellCurrency: BigInt(fees.relayer.amount),
            amountInBuyCurrency: computeFeeInBuyCurrency(fees, details),
          },
        },
      },
    }
  }

  async getBridgeReceiverOverride(_request: QuoteBridgeRequest, quote: RelayQuoteResult): Promise<string> {
    return quote.depositAddress
  }

  async getBridgingParams(
    _chainId: ChainId,
    order: EnrichedOrder,
    _txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    if (!order.receiver) return null

    const quoteBody = this.extractQuoteBodyFromOrder(order)
    if (!quoteBody) return null

    const requestId = quoteBody.steps?.[0]?.requestId
    if (!requestId) return null

    const details = quoteBody.details
    const inputCurrency = details.currencyIn.currency
    const outputCurrency = details.currencyOut.currency
    const timeEstimate = details.timeEstimate ?? 30

    const statusResult = await this.getStatus(requestId, _chainId as SupportedChainId)
    const quoteTimestamp = Math.floor(Date.now() / 1000)

    return {
      status: statusResult,
      params: {
        inputTokenAddress: fromRelayAddress(inputCurrency.address) as `0x${string}`,
        outputTokenAddress: fromRelayAddress(outputCurrency.address) as `0x${string}`,
        inputAmount: BigInt(details.currencyIn.amount),
        outputAmount: BigInt(details.currencyOut.amount),
        owner: order.owner,
        quoteTimestamp,
        fillDeadline: quoteTimestamp + timeEstimate,
        recipient: order.owner as `0x${string}`,
        sourceChainId: inputCurrency.chainId,
        destinationChainId: outputCurrency.chainId,
        bridgingId: requestId,
      },
    }
  }

  private extractQuoteBodyFromOrder(order: EnrichedOrder): RelayQuoteResponse | null {
    try {
      const appData = JSON.parse(order.fullAppData ?? '{}')
      const quoteBody = appData?.metadata?.bridging?.quoteBody
      if (!quoteBody) return null
      return JSON.parse(quoteBody)
    } catch {
      return null
    }
  }

  getExplorerUrl(bridgingId: string): string {
    return `https://relay.link/transaction/${bridgingId}`
  }

  async getStatus(bridgingId: string, _originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    try {
      const response = await this.api.getStatus(bridgingId)
      return {
        status: RELAY_STATUS_TO_COW_STATUS[response.status] ?? BridgeStatus.UNKNOWN,
        depositTxHash: response.inTxHashes?.[0],
        fillTxHash: response.txHashes?.[0],
      }
    } catch {
      return { status: BridgeStatus.UNKNOWN }
    }
  }

  getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
}
