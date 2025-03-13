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
import { getTradeParametersAfterQuote, swapParamsToLimitOrderParams } from './utils'
import { getPreSignTransaction } from './getPreSignTransaction'
import { log } from './consts'
import { OrderBookApi } from '../order-book'
import { getSigner } from '../common/utils/wallet'

interface TradingSdkOptions {
  enableLogging: boolean
  orderBookApi: OrderBookApi
}

export class TradingSdk {
  constructor(
    public readonly traderParams: TraderParameters,
    public readonly options: Partial<TradingSdkOptions> = { enableLogging: false }
  ) {
    if (options.enableLogging) {
      log.enabled = true
    }
  }

  async getQuote(params: TradeParameters, advancedSettings?: SwapAdvancedSettings): Promise<QuoteAndPost> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)

    return {
      quoteResults: quoteResults.result,
      postSwapOrderFromQuote: () =>
        postSwapOrderFromQuote({
          ...quoteResults,
          result: {
            ...quoteResults.result,
            tradeParameters: getTradeParametersAfterQuote({
              quoteParameters: quoteResults.result.tradeParameters,
              orderParameters: params,
            }),
          },
        }),
    }
  }

  async postSwapOrder(params: TradeParameters, advancedSettings?: SwapAdvancedSettings): Promise<string> {
    return postSwapOrder(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  async postLimitOrder(params: LimitTradeParameters, advancedSettings?: LimitOrderAdvancedSettings): Promise<string> {
    return postLimitOrder(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  async postSellNativeCurrencyOrder(
    params: TradeParameters,
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
      )
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
