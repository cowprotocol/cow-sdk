import { OrderKind, OrderParameters } from '../generated'
import { HUNDRED_THOUSANDS, ONE_HUNDRED_BPS } from './quoteAmountsAndCosts.const'

/**
 * /quote API returns `OrderParameters` where protocol fee is already included in the amounts
 * From the quote response we only know:
 *  - protocol fee percent (in BPS)
 *  - quote amount after protocol fee
 *
 * To get the protocol fee amount, we need to derive the quote amount BEFORE the protocol fee first
 * On the API side `quoteAmountAfterProtocolFee` is calculated like that:
 *
 * protocolFeePercent = 0.02
 * quoteAmountBeforeProtocolFee = 100_000
 * protocolFeeAmount = 100_000 * 0.02 / 100 = 20
 * quoteAmountAfterProtocolFee = 100_000 - 20 = 99_980
 *
 * On the client side, we don't know `quoteAmountBeforeProtocolFee`, so we have to reverse it from `quoteAmountAfterProtocolFee`
 *
 * quoteAmountBeforeProtocolFee = 99_980 / (1 - 0.02 / 100) = 100_000
 *
 * Note: the example above is for SELL orders, for BUY orders the protocol fee is added to sellAmount instead of substracting from buyAmount
 *
 * @param params
 */
export function getProtocolFeeAmount(params: { orderParams: OrderParameters; protocolFeeBps: number }): bigint {
  const { orderParams, protocolFeeBps } = params

  const isSell = orderParams.kind === OrderKind.SELL

  if (protocolFeeBps <= 0) {
    return 0n
  }

  const { sellAmount: sellAmountStr, buyAmount: buyAmountStr, feeAmount: feeAmountStr } = orderParams
  const sellAmount = BigInt(sellAmountStr)
  const buyAmount = BigInt(buyAmountStr)
  const feeAmount = BigInt(feeAmountStr)

  const protocolFeeScale = BigInt(HUNDRED_THOUSANDS)
  const protocolFeeBpsBig = BigInt(protocolFeeBps * HUNDRED_THOUSANDS)

  if (isSell) {
    /**
     * SELL orders formula: protocolFeeInBuy = quoteBuyAmount * protocolFeeBps / (1 - protocolFeeBps)
     *
     * The buyAmountAfterNetworkCosts already includes the protocol fee (it was deducted from buyAmount by the API).
     * We need to reconstruct the original buyAmount and calculate the fee amount.
     */
    const denominator = ONE_HUNDRED_BPS * protocolFeeScale - protocolFeeBpsBig
    return (buyAmount * protocolFeeBpsBig) / denominator
  } else {
    /**
     * BUY orders formula: protocolFeeInSell = (quoteSellAmount + feeAmount) * protocolFeeBps / (1 + protocolFeeBps)
     * the sellAmountAfterNetworkCosts already includes the protocol fee (it was added to sellAmount by the API).
     */
    const denominator = ONE_HUNDRED_BPS * protocolFeeScale + protocolFeeBpsBig
    // sellAmountAfterNetworkCosts is already sellAmount + networkCosts (check getQuoteAmountsWithNetworkCosts)
    return ((sellAmount + feeAmount) * protocolFeeBpsBig) / denominator
  }
}
