import {
  LimitOrderAdvancedSettings,
  LimitTradeParameters,
  OrderPostingResult,
  QuoteAndPost,
  SwapAdvancedSettings,
  TradeParameters,
  TraderParameters,
} from './types'
import { postSwapOrder, postSwapOrderFromQuote } from './postSwapOrder'
import { postLimitOrder } from './postLimitOrder'
import { getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getTradeParametersAfterQuote, swapParamsToLimitOrderParams } from './utils/misc'
import { getPreSignTransaction } from './getPreSignTransaction'
import { enableLogging, getGlobalAdapter } from '@cowprotocol/sdk-common'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { AbstractProviderAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'

export type WithPartialTraderParams<T> = T & Partial<TraderParameters>
export let utmContent: string | undefined = undefined
export let disableUtm: boolean = false

export interface TradingSdkOptions {
  enableLogging: boolean
  orderBookApi: OrderBookApi
  utmContent?: string
  disableUtm?: boolean
}

export class TradingSdk {
  constructor(
    public traderParams: Partial<TraderParameters> = {},
    public readonly options: Partial<TradingSdkOptions> = {},
    adapter?: AbstractProviderAdapter,
  ) {
    if (options.enableLogging !== undefined) {
      enableLogging(options.enableLogging)
    }
    if (adapter) {
      setGlobalAdapter(adapter)
    }
    utmContent = options.utmContent
    disableUtm = options.disableUtm || false
  }

  setTraderParams(params: Partial<TraderParameters>) {
    this.traderParams = { ...this.traderParams, ...params }

    return this
  }

  async getQuote(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<QuoteAndPost> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)

    return {
      quoteResults: quoteResults.result,
      postSwapOrderFromQuote: (advancedSettings?: SwapAdvancedSettings) =>
        postSwapOrderFromQuote(
          {
            ...quoteResults,
            result: {
              ...quoteResults.result,
              tradeParameters: getTradeParametersAfterQuote({
                quoteParameters: quoteResults.result.tradeParameters,
                sellToken: params.sellToken,
              }),
            },
          },
          advancedSettings,
        ),
    }
  }

  async getQuoteResults(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<QuoteResultsWithSigner> {
    return getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  async postSwapOrder(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<OrderPostingResult> {
    return postSwapOrder(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  async postLimitOrder(
    params: WithPartialTraderParams<LimitTradeParameters>,
    advancedSettings?: LimitOrderAdvancedSettings,
  ): Promise<OrderPostingResult> {
    return postLimitOrder(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  /**
   * Posts a sell order for native currency (e.g., ETH) using the EthFlow contract.
   * This method creates an on-chain transaction for selling native tokens.
   *
   * @param params - The trade parameters including token addresses and amounts
   * @param advancedSettings - Optional advanced settings for the swap
   * @returns Promise resolving to the order posting result with transaction hash and order ID
   *
   * @example
   * ```typescript
   * const parameters: TradeParameters = {
   *   kind: OrderKind.SELL,
   *   sellToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH
   *   sellTokenDecimals: 18,
   *   buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
   *   buyTokenDecimals: 18,
   *   amount: '100000000000000000', // 0.1 ETH
   * }
   *
   * const { orderId, txHash } = await sdk.postSellNativeCurrencyOrder(parameters)
   * ```
   */
  async postSellNativeCurrencyOrder(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<ReturnType<typeof postSellNativeCurrencyOrder>> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)

    const { tradeParameters, quoteResponse } = quoteResults.result
    return postSellNativeCurrencyOrder(
      quoteResults.orderBookApi,
      quoteResults.result.appDataInfo,
      // Quote response always has an id
      swapParamsToLimitOrderParams(
        getTradeParametersAfterQuote({ quoteParameters: tradeParameters, sellToken: params.sellToken }),
        quoteResponse,
      ),
      advancedSettings?.additionalParams,
      quoteResults.result.signer,
    )
  }

  async getPreSignTransaction(
    params: WithPartialTraderParams<{ orderId: string; account: string }>,
  ): ReturnType<typeof getPreSignTransaction> {
    const adapter = getGlobalAdapter()

    const traderParams = this.mergeParams(params)
    const signer = traderParams.signer ? adapter.createSigner(traderParams.signer) : adapter.signer

    return getPreSignTransaction(signer, traderParams.chainId, params.account, params.orderId)
  }

  private mergeParams<T>(params: T & Partial<TraderParameters>): T & TraderParameters {
    const { chainId, signer, appCode, env } = params
    const traderParams: Partial<TraderParameters> = {
      chainId: chainId || this.traderParams.chainId,
      signer: signer || this.traderParams.signer,
      appCode: appCode || this.traderParams.appCode,
      env: env || this.traderParams.env,
    }
    assertTraderParams(traderParams)

    return {
      ...params,
      ...traderParams,
    }
  }
}

function assertTraderParams(params: Partial<TraderParameters>): asserts params is TraderParameters {
  if (!isTraderParameters(params)) {
    throw new Error('Missing trader parameters: ' + getMissingTraderParams(params).join(', '))
  }
}

function getMissingTraderParams(params: Partial<TraderParameters>): string[] {
  const missingParams = []
  if (!params.chainId) missingParams.push('chainId')
  if (!params.signer) missingParams.push('signer')
  if (!params.appCode) missingParams.push('appCode')
  return missingParams
}

function isTraderParameters(params: Partial<TraderParameters>): params is TraderParameters {
  return getMissingTraderParams(params).length === 0
}
