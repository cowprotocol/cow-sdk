import { OrderKind, OrderParameters } from '../generated'
import { HUNDRED_THOUSANDS, ONE_HUNDRED_BPS } from './quoteAmountsAndCosts.const'

const PROTOCOL_FEE_BPS_SCALE = BigInt(HUNDRED_THOUSANDS)

export interface ProtocolFeeAmountParams {
  orderParams: OrderParameters
  protocolFeeBps: number
}

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
export function getProtocolFeeAmount(params: ProtocolFeeAmountParams): bigint {
  const { orderParams, protocolFeeBps } = params

  const isSell = orderParams.kind === OrderKind.SELL

  if (protocolFeeBps <= 0) {
    return 0n
  }

  const { sellAmount: sellAmountStr, buyAmount: buyAmountStr } = orderParams
  const sellAmount = BigInt(sellAmountStr)
  const buyAmount = BigInt(buyAmountStr)

  const protocolFeeScale = PROTOCOL_FEE_BPS_SCALE
  // Keep 5 decimal places of bps precision while avoiding BigInt conversion from non-integer floats.
  const protocolFeeBpsBig = BigInt(Math.round(protocolFeeBps * HUNDRED_THOUSANDS))

  if (protocolFeeBpsBig <= 0n) {
    return 0n
  }

  if (isSell) {
    /**
     * SELL orders formula: protocolFeeInBuy = quoteBuyAmount * protocolFeeBps / (1 - protocolFeeBps)
     *
     * `orderParams.buyAmount` already has the protocol fee deducted (it was subtracted from
     * buyAmount by the API). We reverse just that one deduction to get the fee amount.
     */
    const denominator = ONE_HUNDRED_BPS * protocolFeeScale - protocolFeeBpsBig
    return (buyAmount * protocolFeeBpsBig) / denominator
  } else {
    /**
     * BUY orders formula: protocolFeeInSell = quoteSellAmount * protocolFeeBps / (1 + protocolFeeBps)
     *
     * `orderParams.sellAmount` already has the protocol fee added (it was added to sellAmount by
     * the API) but does NOT yet include network costs -- `feeAmount` is reported separately and
     * must be added on top later, it must not be folded into this reversal (see README.md ->
     * "How sellAmount differs between SELL and BUY orders", and getQuoteAmountsAndCosts.ts's own
     * `beforeAllFees.sellAmount = sellAmount - protocolFeeAmount`, which only makes sense if
     * `sellAmount` alone -- not `sellAmount + feeAmount` -- is the protocol-fee-inclusive base).
     */
    const denominator = ONE_HUNDRED_BPS * protocolFeeScale + protocolFeeBpsBig
    return (sellAmount * protocolFeeBpsBig) / denominator
  }
}
