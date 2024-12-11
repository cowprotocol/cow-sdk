import { SwapAdvancedSettings, SwapParameters } from './types'

import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { swapParamsToLimitOrderParams } from './utils'

export async function postSwapOrder(params: SwapParameters, advancedSettings?: SwapAdvancedSettings) {
  return postSwapOrderFromQuote(await getQuoteWithSigner(params, advancedSettings))
}

export async function postSwapOrderFromQuote({
  orderBookApi,
  result: { signer, appDataInfo, quoteResponse, tradeParameters, amountsAndCosts },
}: QuoteResultsWithSigner): Promise<string> {
  return postCoWProtocolTrade(
    orderBookApi,
    signer,
    appDataInfo,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    swapParamsToLimitOrderParams(tradeParameters, quoteResponse.id!, amountsAndCosts),
    quoteResponse.quote.feeAmount
  )
}
