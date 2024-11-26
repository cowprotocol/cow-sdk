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
import { getQuoteWithSigner } from './getQuote'
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
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings)

    const { tradeParameters, quoteResponse, amountsAndCosts } = quoteResults.result
    return postOnChainTrade(
      quoteResults.orderBookApi,
      quoteResults.result.signer,
      quoteResults.result.appDataInfo,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      swapParamsToLimitOrderParams(tradeParameters, quoteResponse.id!, amountsAndCosts)
    )
  }

  async getQuote(params: TradeParameters, advancedSettings?: SwapAdvancedSettings): Promise<QuoteAndPost> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings)

    return {
      quoteResults: quoteResults.result,
      postSwapOrderFromQuote: () => postSwapOrderFromQuote(quoteResults),
    }
  }

  private mergeParams<T>(params: T): T & TraderParameters {
    return { ...params, ...this.traderParams }
  }
}
