import { QuoteAmountsWithNetworkCosts, QuoteParameters } from './quoteAmountsAndCosts.types'
import { OrderKind } from '../generated'
import { getProtocolFeeAmount } from './getProtocolFeeAmount'

export function getQuoteAmountsWithNetworkCosts(params: QuoteParameters): QuoteAmountsWithNetworkCosts {
  const { orderParams, protocolFeeBps = 0 } = params

  const isSell = orderParams.kind === OrderKind.SELL

  const protocolFeeAmount = getProtocolFeeAmount({ orderParams, protocolFeeBps })

  const networkCostAmount = BigInt(orderParams.feeAmount)
  const sellAmountBeforeNetworkCosts = BigInt(orderParams.sellAmount)
  const buyAmountAfterNetworkCosts = BigInt(orderParams.buyAmount)

  /**
   * quotePrice as a rational number (numerator / denominator) to avoid precision loss.
   *
   * For SELL: price = (buyAmountAfterNetworkCosts + protocolFeeAmount) / sellAmountBeforeNetworkCosts
   * For BUY: price = buyAmountAfterNetworkCosts / (sellAmountBeforeNetworkCosts - protocolFeeAmount)
   */
  const quotePriceNumerator = isSell ? buyAmountAfterNetworkCosts + protocolFeeAmount : buyAmountAfterNetworkCosts
  const quotePriceDenominator = isSell ? sellAmountBeforeNetworkCosts : sellAmountBeforeNetworkCosts - protocolFeeAmount

  const sellAmountAfterNetworkCosts = sellAmountBeforeNetworkCosts + networkCostAmount

  /**
   * buyAmountBeforeNetworkCosts = quotePrice * sellAmountAfterNetworkCosts
   * = quotePriceNumerator * sellAmountAfterNetworkCosts / quotePriceDenominator
   */
  const buyAmountBeforeNetworkCosts = (quotePriceNumerator * sellAmountAfterNetworkCosts) / quotePriceDenominator

  return {
    isSell,
    quotePriceParams: { numerator: quotePriceNumerator, denominator: quotePriceDenominator },
    networkCostAmount,
    sellAmountBeforeNetworkCosts,
    buyAmountAfterNetworkCosts,
    sellAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
  }
}
