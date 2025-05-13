import { getQuoteAmountsWithCosts, OrderQuoteResponse } from '../order-book'
import { suggestSlippageBpsFromFee } from './suggestSlippageBpsFromFee'
import { QuoterParameters, SwapAdvancedSettings, TradeParameters } from './types'

const SLIPPAGE_FEE_MULTIPLIER_PERCENT = 50

export interface SuggestSlippageBps {
  tradeParameters: TradeParameters
  quote: OrderQuoteResponse
  trader: QuoterParameters
  advancedSettings?: SwapAdvancedSettings
}

/**
 * Return the slippage in BPS that would allow the fee to increase by the multiplying factor percent.
 */
export function suggestSlippageBps(params: SuggestSlippageBps): number {
  const { quote, tradeParameters } = params
  const { sellTokenDecimals, buyTokenDecimals } = tradeParameters

  // Calculate the amount of the sell token before and after network costs
  const { isSell, sellAmountBeforeNetworkCosts, sellAmountAfterNetworkCosts } = getQuoteAmountsWithCosts({
    sellDecimals: sellTokenDecimals,
    buyDecimals: buyTokenDecimals,
    orderParams: quote.quote,
  })

  // Get the relevant amount of the sell token (depending on the order kind)
  const sellAmount = isSell ? sellAmountAfterNetworkCosts : sellAmountBeforeNetworkCosts
  const { feeAmount } = quote.quote

  return suggestSlippageBpsFromFee({
    feeAmount: BigInt(feeAmount),
    sellAmount,
    isSell,
    multiplyingFactorPercent: SLIPPAGE_FEE_MULTIPLIER_PERCENT,
  })
}
