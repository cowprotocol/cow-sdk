import { getSigner } from 'src/common/utils/wallet'
import { OrderBookApi, OrderQuoteResponse } from '../order-book'
import { DEFAULT_SLIPPAGE_BPS } from './consts'
import { getQuoteRaw, getTrader } from './getQuote'
import { QuoterParameters, SwapAdvancedSettings, SwapParameters, TradeParameters } from './types'

export interface SuggestSlippageBps {
  tradeParameters: TradeParameters
  quote: OrderQuoteResponse
  trader: QuoterParameters
  advancedSettings?: SwapAdvancedSettings
}

export function suggestSlippageBps(_params: SuggestSlippageBps): number {
  // TODO: Do something really smart here :)
  return DEFAULT_SLIPPAGE_BPS
}

export async function getSuggestedSlippageBpsWithSigner(
  swapParameters: SwapParameters,
  advancedSettings?: SwapAdvancedSettings,
  _orderBookApi?: OrderBookApi
): Promise<number> {
  const signer = getSigner(swapParameters.signer)
  const trader = await getTrader(signer, swapParameters)

  // Get quote
  const { quote, tradeParameters } = await getQuoteRaw(swapParameters, trader, advancedSettings, _orderBookApi)

  return suggestSlippageBps({ quote, tradeParameters, trader, advancedSettings })
}
