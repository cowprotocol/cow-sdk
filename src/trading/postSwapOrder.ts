import { SwapAdvancedSettings, SwapParameters } from './types'

import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { swapParamsToLimitOrderParams } from './utils'
import { OrderBookApi } from '../order-book'

export async function postSwapOrder(
  params: SwapParameters,
  advancedSettings?: SwapAdvancedSettings,
  orderBookApi?: OrderBookApi
) {
  return postSwapOrderFromQuote(await getQuoteWithSigner(params, advancedSettings, orderBookApi))
}

export async function postSwapOrderFromQuote({
  orderBookApi,
  result: { signer, appDataInfo, quoteResponse, tradeParameters },
}: QuoteResultsWithSigner): Promise<string> {
  return postCoWProtocolTrade(
    orderBookApi,
    signer,
    appDataInfo,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    swapParamsToLimitOrderParams(tradeParameters, quoteResponse),
    quoteResponse.quote.feeAmount
  )
}
