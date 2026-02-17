import { QuoteAmountsWithNetworkCosts, QuoteParameters } from './quoteAmountsAndCosts.types'
import { OrderKind } from '../generated'
import { getProtocolFeeAmount } from './getProtocolFeeAmount'

/**
 * Important to understand, that /quote API response includes sellAmount and buyAmount
 * Which are amounts AFTER protocol fee and network costs
 * To get the amounts BEFORE protocol fee and network costs, we add them back
 * See `QuoteAmountsWithNetworkCosts` description for better understanding
 */
export function getQuoteAmountsWithNetworkCosts(params: QuoteParameters): QuoteAmountsWithNetworkCosts {
  const { orderParams, protocolFeeBps = 0 } = params

  const isSell = orderParams.kind === OrderKind.SELL

  const protocolFeeAmount = getProtocolFeeAmount({ orderParams, protocolFeeBps })

  const sellAmount = BigInt(orderParams.sellAmount)
  const buyAmount = BigInt(orderParams.buyAmount)
  const networkCostAmount = BigInt(orderParams.feeAmount)

  /**
   * Adding network costs to sell amount back, because API returns sell amount baked with network costs
   * The network costs are stored separately as feeAmount
   */
  const sellAmountBeforeNetworkCosts = isSell ? sellAmount + networkCostAmount : sellAmount - networkCostAmount
  /**
   * The quote from API includes network fees by default
   */
  const sellAmountAfterNetworkCosts = sellAmount

  /**
   * Since network costs are always applying to sellAmount, we don't take then into account for buyAmount
   * And protocol fee applies to the surplus amount, which is buyAmount in case of SELL order
   */
  const buyAmountBeforeNetworkCosts = isSell ? buyAmount + protocolFeeAmount : buyAmount
  /**
   * Since network costs are always applying to sellAmount, buyAmount doesn't change
   */
  const buyAmountAfterNetworkCosts = buyAmountBeforeNetworkCosts

  return {
    isSell,
    quotePriceParams: { numerator: buyAmount, denominator: sellAmount },
    networkCostAmount,
    sellAmountBeforeNetworkCosts,
    buyAmountAfterNetworkCosts,
    sellAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
  }
}
