import { SwapAdvancedSettings, SwapParameters } from './types'

import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { swapParamsToLimitOrderParams } from './utils'

export async function postSwapOrder(params: SwapParameters, advancedSettings?: SwapAdvancedSettings) {
  return postSwapOrderFromQuote(await getQuoteWithSigner(params, advancedSettings))
}

export async function postSwapOrderFromQuote({
  orderBookApi,
  signer,
  appDataInfo,
  quoteResponse,
  tradeParameters,
}: QuoteResultsWithSigner): Promise<string> {
  return postCoWProtocolTrade(
    orderBookApi,
    signer,
    appDataInfo,
    swapParamsToLimitOrderParams(tradeParameters, quoteResponse),
    quoteResponse.quote.feeAmount
  )
}
