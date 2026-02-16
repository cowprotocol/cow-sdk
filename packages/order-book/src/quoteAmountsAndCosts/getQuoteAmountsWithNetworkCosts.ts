import { QuoteAmountsWithNetworkCosts, QuoteParameters } from './quoteAmountsAndCosts.types'
import { getBigNumber } from './quoteAmountsAndCosts.utils'
import { OrderKind } from '../generated'
import { getProtocolFeeAmount } from './getProtocolFeeAmount'

export function getQuoteAmountsWithNetworkCosts(params: QuoteParameters): QuoteAmountsWithNetworkCosts {
  const { sellDecimals, buyDecimals, orderParams, protocolFeeBps = 0 } = params

  const isSell = orderParams.kind === OrderKind.SELL

  const protocolFeeAmount = getProtocolFeeAmount({ orderParams, isSell, protocolFeeBps })
  const protocolFeeAmountDecimals = isSell ? buyDecimals : sellDecimals
  const { num: protocolFeeAmountNum } = getBigNumber(protocolFeeAmount, protocolFeeAmountDecimals)

  /**
   * Wrap raw values into bigNumbers
   * We also make amounts names more specific with "beforeNetworkCosts" and "afterNetworkCosts" suffixes
   */
  const networkCostAmount = getBigNumber(orderParams.feeAmount, sellDecimals)
  const sellAmountBeforeNetworkCosts = getBigNumber(orderParams.sellAmount, sellDecimals)
  const buyAmountAfterNetworkCosts = getBigNumber(orderParams.buyAmount, buyDecimals)

  /**
   * This is an actual price of the quote since it's derived only from the quote sell and buy amounts
   * if protocolFeeBps is 0, this price will be the same
   */
  const quotePrice = isSell
    ? // For SELL order is already deducting protocol fees from buyAmount, so we need to add it back to get the actual price
      (buyAmountAfterNetworkCosts.num + protocolFeeAmountNum) / sellAmountBeforeNetworkCosts.num
    : // For BUY order is already adding protocol fees to sellAmount, so we need to subtract it to get the actual price
      buyAmountAfterNetworkCosts.num / (sellAmountBeforeNetworkCosts.num - protocolFeeAmountNum)

  /**
   * Before amount + networkCosts = After networkCosts :)
   */
  const sellAmountAfterNetworkCosts = getBigNumber(
    sellAmountBeforeNetworkCosts.big + networkCostAmount.big,
    sellDecimals,
  )

  /**
   * Since the quote contains only buy amount after network costs
   * we have to calculate the buy amount before network costs from the quote price
   */
  const buyAmountBeforeNetworkCosts = getBigNumber(quotePrice * sellAmountAfterNetworkCosts.num, buyDecimals)

  return {
    isSell,
    quotePrice,
    networkCostAmount,
    sellAmountBeforeNetworkCosts,
    buyAmountAfterNetworkCosts,
    sellAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
  }
}
