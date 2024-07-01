import { SwapAdvancedSettings, SwapParameters } from './types'

import { postCoWProtocolTrade } from './postTrade'
import { getQuote } from './getQuote'

export async function postSwapOrder(params: SwapParameters, advancedSettings?: SwapAdvancedSettings) {
  const {
    orderBookApi,
    signer,
    quoteResponse: { quote, id: quoteId },
    appDataInfo,
  } = await getQuote(params, advancedSettings)

  await postCoWProtocolTrade(orderBookApi, signer, appDataInfo, {
    ...params,
    quoteId,
    sellAmount: quote.sellAmount,
    buyAmount: quote.buyAmount,
    networkCostsAmount: quote.feeAmount,
  })
}
