import {
  LimitOrderAdvancedSettings,
  LimitTradeParameters,
  QuoteAndPost,
  QuoteResults,
  SwapAdvancedSettings,
  TradeParameters,
  TraderParameters,
} from './types'
import { postSwapOrder, postSwapOrderFromQuote } from './postSwapOrder'
import { postLimitOrder } from './postLimitOrder'
import { getQuoteWithSigner } from './getQuote'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getTradeParametersAfterQuote, swapParamsToLimitOrderParams } from './utils'
import { getPreSignTransaction } from './getPreSignTransaction'
import { log } from './consts'
import { OrderBookApi } from '../order-book'
import { getSigner } from '../common/utils/wallet'

export type WithPartialTraderParams<T> = T & Partial<TraderParameters>

export interface TradingSdkOptions {
  enableLogging: boolean
  orderBookApi: OrderBookApi
}

export class TradingSdk {
  constructor(
    public traderParams: TraderParameters,
    public readonly options: Partial<TradingSdkOptions> = { enableLogging: false }
  ) {
    if (options.enableLogging) {
      log.enabled = true
    }
  }

  setTraderParams(params: Partial<TraderParameters>) {
    this.traderParams = { ...this.traderParams, ...params }

    return this
  }

  async getQuote(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings
  ): Promise<QuoteAndPost> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
    quoteResults.orderBookApi

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
                orderParameters: params,
              }),
            },
          },
          advancedSettings
        ),
    }
  }

  async getQuoteResults(params: TradeParameters, advancedSettings?: SwapAdvancedSettings): Promise<QuoteResults> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
    return quoteResults.result
  }

  async postSwapOrder(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings
  ): Promise<string> {
    return postSwapOrder(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  async postLimitOrder(
    params: WithPartialTraderParams<LimitTradeParameters>,
    advancedSettings?: LimitOrderAdvancedSettings
  ): Promise<string> {
    return postLimitOrder(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  async postSellNativeCurrencyOrder(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings
  ): Promise<ReturnType<typeof postSellNativeCurrencyOrder>> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)

    const { tradeParameters, quoteResponse } = quoteResults.result
    return postSellNativeCurrencyOrder(
      quoteResults.orderBookApi,
      quoteResults.result.signer,
      quoteResults.result.appDataInfo,
      // Quote response response always has an id
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      swapParamsToLimitOrderParams(
        getTradeParametersAfterQuote({ quoteParameters: tradeParameters, orderParameters: params }),
        quoteResponse
      ),
      advancedSettings?.additionalParams
    )
  }

  async getPreSignTransaction(
    params: WithPartialTraderParams<{ orderId: string; account: string }>
  ): ReturnType<typeof getPreSignTransaction> {
    const traderParams = this.mergeParams(params)
    const signer = getSigner(traderParams.signer)

    return getPreSignTransaction(signer, traderParams.chainId, params.account, params.orderId)
  }

  private mergeParams<T>(params: T & Partial<TraderParameters>): T & TraderParameters {
    return {
      ...params,
      chainId: params.chainId || this.traderParams.chainId,
      signer: params.signer || this.traderParams.signer,
      appCode: params.appCode || this.traderParams.appCode,
    }
  }
}
