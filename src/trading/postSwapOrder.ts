import { OrderPostingResult, SwapAdvancedSettings, SwapParameters } from './types'

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
  { orderBookApi, result: { signer, appDataInfo, quoteResponse, tradeParameters } }: QuoteResultsWithSigner,
  advancedSettings?: SwapAdvancedSettings
): Promise<OrderPostingResult> {
  const params = swapParamsToLimitOrderParams(tradeParameters, quoteResponse)
  const appDataSlippage = advancedSettings?.appData?.metadata?.quote?.slippageBips

  /**
   * Special case for CoW Swap where we have smart slippage
   * We update appData slippage without refetching quote
   */
  if (typeof appDataSlippage !== 'undefined') {
    params.slippageBps = appDataSlippage
  }

  return postCoWProtocolTrade(orderBookApi, signer, appDataInfo, params, {
    signingScheme: advancedSettings?.quoteRequest?.signingScheme,
    networkCostsAmount: quoteResponse.quote.feeAmount,
    ...advancedSettings?.additionalParams,
  })
}
