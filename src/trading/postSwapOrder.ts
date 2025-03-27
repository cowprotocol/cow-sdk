import { OrderPostingResult, SwapAdvancedSettings, SwapParameters } from './types'

import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { swapParamsToLimitOrderParams } from './utils'
import { OrderBookApi } from '../order-book'
import { mergeAppDataDoc } from './appDataUtils'

export async function postSwapOrder(
  params: SwapParameters,
  advancedSettings?: SwapAdvancedSettings,
  orderBookApi?: OrderBookApi
) {
  return postSwapOrderFromQuote(await getQuoteWithSigner(params, advancedSettings, orderBookApi), advancedSettings)
}

export async function postSwapOrderFromQuote(
  {
    orderBookApi,
    result: { signer, appDataInfo: _appDataInfo, quoteResponse, tradeParameters },
  }: QuoteResultsWithSigner,
  advancedSettings?: SwapAdvancedSettings
): Promise<OrderPostingResult> {
  const params = swapParamsToLimitOrderParams(tradeParameters, quoteResponse)
  const appDataOverride = advancedSettings?.appData
  const appDataInfo = appDataOverride ? await mergeAppDataDoc(_appDataInfo.doc, appDataOverride) : _appDataInfo
  const appDataSlippageOverride = appDataOverride?.metadata?.quote?.slippageBips
  const partnerFeeOverride = appDataOverride?.metadata?.partnerFee

  /**
   * Special case for CoW Swap where we have smart slippage
   * We update appData slippage without refetching quote
   */
  if (typeof appDataSlippageOverride !== 'undefined') {
    params.slippageBps = appDataSlippageOverride
  }

  /**
   * Same as above, in case if partnerFee dynamically changed
   */
  if (partnerFeeOverride) {
    params.partnerFee = partnerFeeOverride
  }

  return postCoWProtocolTrade(orderBookApi, signer, appDataInfo, params, {
    signingScheme: advancedSettings?.quoteRequest?.signingScheme,
    networkCostsAmount: quoteResponse.quote.feeAmount,
    ...advancedSettings?.additionalParams,
  })
}
