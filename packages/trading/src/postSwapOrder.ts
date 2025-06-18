import { OrderPostingResult, SwapAdvancedSettings, SwapParameters } from './types'

import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { swapParamsToLimitOrderParams } from './utils/misc'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { mergeAppDataDoc } from './appDataUtils'

export async function postSwapOrder(
  params: SwapParameters,
  advancedSettings?: SwapAdvancedSettings,
  orderBookApi?: OrderBookApi,
) {
  return postSwapOrderFromQuote(await getQuoteWithSigner(params, advancedSettings, orderBookApi), advancedSettings)
}

export async function postSwapOrderFromQuote(
  {
    orderBookApi,
    result: { signer, appDataInfo: _appDataInfo, quoteResponse, tradeParameters },
  }: QuoteResultsWithSigner,
  advancedSettings?: SwapAdvancedSettings,
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

  /**
   * Override order parameters with advanced settings
   */
  if (advancedSettings?.quoteRequest) {
    const { receiver, validTo, sellToken, buyToken } = advancedSettings.quoteRequest

    if (receiver) params.receiver = receiver
    if (validTo) params.validTo = validTo
    if (sellToken) params.sellToken = sellToken
    if (buyToken) params.buyToken = buyToken
  }

  return postCoWProtocolTrade(orderBookApi, signer, appDataInfo, params, {
    signingScheme: advancedSettings?.quoteRequest?.signingScheme,
    networkCostsAmount: quoteResponse.quote.feeAmount,
    ...advancedSettings?.additionalParams,
  })
}
