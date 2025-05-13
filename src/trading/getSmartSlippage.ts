import { getSigner } from 'src/common/utils/wallet'
import { OrderBookApi, OrderQuoteResponse } from '../order-book'
import { DEFAULT_SLIPPAGE_BPS } from './consts'
import { getQuoteRaw, getTrader } from './getQuote'
import { QuoterParameters, SwapAdvancedSettings, SwapParameters, TradeParameters } from './types'

export interface CalculateSmartSlippageBps {
  tradeParameters: TradeParameters
  quote: OrderQuoteResponse
  trader: QuoterParameters
  advancedSettings?: SwapAdvancedSettings
}

export function calculateSmartSlippageBps(_params: CalculateSmartSlippageBps): number {
  // TODO: Do something really smart here :)
  return DEFAULT_SLIPPAGE_BPS
}

export async function getSmartSlippageBpsWithSigner(
  swapParameters: SwapParameters,
  advancedSettings?: SwapAdvancedSettings,
  _orderBookApi?: OrderBookApi
): Promise<number> {
  const signer = getSigner(swapParameters.signer)
  const trader = await getTrader(signer, swapParameters)

  // Get quote
  const { quote, tradeParameters } = await getQuoteRaw(swapParameters, trader, advancedSettings, _orderBookApi)

  // Calculate smart slippage
  return calculateSmartSlippageBps({ quote, tradeParameters, trader, advancedSettings })
}
