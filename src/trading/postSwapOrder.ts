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
  return postSwapOrderFromQuote(await getQuoteWithSigner(params, advancedSettings, orderBookApi), advancedSettings)
}

export async function postSwapOrderFromQuote(
  quoteResults: QuoteResultsWithSigner,
  advancedSettings?: SwapAdvancedSettings
): Promise<string> {
  const {
    orderBookApi,
    result: { signer, appDataInfo, quoteResponse, tradeParameters },
  } = quoteResults

  return postCoWProtocolTrade(
    orderBookApi,
    signer,
    appDataInfo,

    swapParamsToLimitOrderParams(tradeParameters, quoteResponse),
    {
      signingScheme: advancedSettings?.quoteRequest?.signingScheme,
      networkCostsAmount: quoteResponse.quote.feeAmount,
      ...advancedSettings?.additionalParams,
    }
  )
}
