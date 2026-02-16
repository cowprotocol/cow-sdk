import { OrderParameters } from '../generated'
import { HUNDRED_THOUSANDS, ONE_HUNDRED_BPS } from './quoteAmountsAndCosts.const'

export function getProtocolFeeAmount(params: {
  orderParams: OrderParameters
  isSell: boolean
  protocolFeeBps: number
}): bigint {
  const { orderParams, protocolFeeBps, isSell } = params
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
    // sellAmountAfterNetworkCosts is already sellAmount + networkCosts (check _getQuoteAmountsWithCosts)
    return ((sellAmount + feeAmount) * protocolFeeBpsBig) / denominator
  }
}
