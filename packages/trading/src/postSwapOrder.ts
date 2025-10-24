import { OrderPostingResult, SwapAdvancedSettings, SwapParameters } from './types'

import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { swapParamsToLimitOrderParams } from './utils/misc'
import { mergeAppDataDoc } from './appDataUtils'
import { applySettingsToLimitTradeParameters } from './utils/applySettingsToLimitTradeParameters'

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
  const appDataOverride = advancedSettings?.appData
  const appDataInfo = appDataOverride ? await mergeAppDataDoc(_appDataInfo.doc, appDataOverride) : _appDataInfo

  const params = applySettingsToLimitTradeParameters(
    swapParamsToLimitOrderParams(tradeParameters, quoteResponse),
    advancedSettings,
  )

  return postCoWProtocolTrade(
    orderBookApi,
    appDataInfo,
    params,
    {
      signingScheme: advancedSettings?.quoteRequest?.signingScheme,
      networkCostsAmount: quoteResponse.quote.feeAmount,
      ...advancedSettings?.additionalParams,
    },
    signer,
  )
}
