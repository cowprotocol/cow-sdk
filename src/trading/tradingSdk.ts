import {
  LimitOrderAdvancedSettings,
  LimitTradeParameters,
  QuoteAndPost,
  SwapAdvancedSettings,
  TradeParameters,
  TraderParameters,
} from './types'
import { postSwapOrder, postSwapOrderFromQuote } from './postSwapOrder'
import { postLimitOrder } from './postLimitOrder'
import { getQuote } from './getQuote'
import { postOnChainTrade } from './postOnChainTrade'
import { swapParamsToLimitOrderParams } from './utils'

export class TradingSdk {
  constructor(public readonly traderParams: TraderParameters) {}

  async postSwapOrder(params: TradeParameters, advancedSettings?: SwapAdvancedSettings) {
    return postSwapOrder(this.mergeParams(params), advancedSettings)
  }

  async postLimitOrder(params: LimitTradeParameters, advancedSettings?: LimitOrderAdvancedSettings) {
    return postLimitOrder(this.mergeParams(params), advancedSettings)
  }

  async postOnChainTrade(params: TradeParameters, advancedSettings?: SwapAdvancedSettings) {
    const quoteResults = await getQuote(this.mergeParams(params), advancedSettings)

    return postOnChainTrade(
      quoteResults.orderBookApi,
      quoteResults.signer,
      quoteResults.appDataInfo,
      swapParamsToLimitOrderParams(quoteResults.swapParameters, quoteResults.quoteResponse)
    )
  }

  async getQuote(params: TradeParameters, advancedSettings?: SwapAdvancedSettings): Promise<QuoteAndPost> {
    const quoteResults = await getQuote(this.mergeParams(params), advancedSettings)

    return {
      quoteResults,
      postSwapOrderFromQuote: () => postSwapOrderFromQuote(quoteResults),
    }
  }

  private mergeParams<T>(params: T): T & TraderParameters {
    return { ...params, ...this.traderParams }
  }
}
