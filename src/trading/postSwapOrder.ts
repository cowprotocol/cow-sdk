import { SwapAdvancedSettings, SwapParameters } from './types'

import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getQuote, QuoteResults } from './getQuote'
import { swapParamsToLimitOrderParams } from './utils'

export async function postSwapOrder(params: SwapParameters, advancedSettings?: SwapAdvancedSettings) {
  return postSwapOrderFromQuote(await getQuote(params, advancedSettings))
}

export async function postSwapOrderFromQuote({
  orderBookApi,
  signer,
  appDataInfo,
  quoteResponse,
  swapParameters,
}: QuoteResults): Promise<string> {
  return postCoWProtocolTrade(
    orderBookApi,
    signer,
    appDataInfo,
    swapParamsToLimitOrderParams(swapParameters, quoteResponse),
    quoteResponse.quote.feeAmount
  )
}
