import { OrderQuoteResponse } from '../order-book'
import { DEFAULT_SLIPPAGE_BPS } from './consts'
import { QuoterParameters, SwapAdvancedSettings, TradeParameters } from './types'

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
