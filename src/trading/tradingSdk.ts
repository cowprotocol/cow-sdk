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
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getSigner, swapParamsToLimitOrderParams } from './utils'
import { getPreSignTransaction } from './getPreSignTransaction'

export class TradingSdk {
  constructor(public readonly traderParams: TraderParameters) {}

  async getQuote(params: TradeParameters, advancedSettings?: SwapAdvancedSettings): Promise<QuoteAndPost> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings)

    return {
      quoteResults: quoteResults.result,
      postSwapOrderFromQuote: () => postSwapOrderFromQuote(quoteResults),
    }
  }

  async postSwapOrder(params: TradeParameters, advancedSettings?: SwapAdvancedSettings): Promise<string> {
    return postSwapOrder(this.mergeParams(params), advancedSettings)
  }

  async postLimitOrder(params: LimitTradeParameters, advancedSettings?: LimitOrderAdvancedSettings): Promise<string> {
    return postLimitOrder(this.mergeParams(params), advancedSettings)
  }

  async postSellNativeCurrencyOrder(
    params: TradeParameters,
    advancedSettings?: SwapAdvancedSettings
  ): Promise<ReturnType<typeof postSellNativeCurrencyOrder>> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings)

    const { tradeParameters, quoteResponse, amountsAndCosts } = quoteResults.result
    return postSellNativeCurrencyOrder(
      quoteResults.orderBookApi,
      quoteResults.result.signer,
      quoteResults.result.appDataInfo,
      // Quote response response always has an id
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      swapParamsToLimitOrderParams(tradeParameters, quoteResponse.id!, amountsAndCosts)
    )
  }

  async getPreSignTransaction(params: { orderId: string; account: string }): ReturnType<typeof getPreSignTransaction> {
    const signer = getSigner(this.traderParams.signer)

    return getPreSignTransaction(signer, this.traderParams.chainId, params.account, params.orderId)
  }

  private mergeParams<T>(params: T): T & TraderParameters {
    return { ...params, ...this.traderParams }
  }
}
