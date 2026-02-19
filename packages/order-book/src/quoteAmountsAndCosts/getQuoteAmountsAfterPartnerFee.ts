import { ONE_HUNDRED_BPS } from './quoteAmountsAndCosts.const'
import { OrderAmountsBig } from './quoteAmountsAndCosts.types'
import { Amounts } from '../types'

interface QuoteAmountsAfterPartnerFeeParams {
  afterNetworkCosts: Amounts<bigint>
  beforeAllFees: Amounts<bigint>
  isSell: boolean
  partnerFeeBps: number
}

interface QuoteAmountsAfterPartnerFee {
  partnerFeeAmount: bigint
  afterPartnerFees: OrderAmountsBig
}

/**
 * Calculates the partner fee amount and adjusts quote amounts accordingly.
 *
 * The partner fee is computed relative to the spot price (`beforeAllFees`) to ensure
 * it reflects the full trade volume, not the volume already reduced by protocol fee.
 *
 * - **SELL orders:** partner fee is subtracted from `buyAmount` (user receives less)
 * - **BUY orders:** partner fee is added to `sellAmount` (user pays more)
 *
 * @param params.afterNetworkCosts - Amounts after network costs, used as the base for adjustment.
 * @param params.beforeAllFees - Spot price amounts used to calculate the fee percentage.
 * @param params.isSell - Whether this is a sell order.
 * @param params.partnerFeeBps - Partner fee in basis points (0 = no partner fee).
 * @returns The partner fee amount and the adjusted amounts after partner fees.
 */
export function getQuoteAmountsAfterPartnerFee(params: QuoteAmountsAfterPartnerFeeParams): QuoteAmountsAfterPartnerFee {
  const { afterNetworkCosts, beforeAllFees, isSell, partnerFeeBps } = params

  /**
   * Important! Partner fee is calculated relatively to the spot price, which has amounts before all fees
   */
  const surplusAmountForPartnerFee = isSell ? beforeAllFees.buyAmount : beforeAllFees.sellAmount
  const partnerFeeAmount =
    partnerFeeBps > 0 ? (surplusAmountForPartnerFee * BigInt(partnerFeeBps)) / ONE_HUNDRED_BPS : BigInt(0)

  /**
   * Partner fee applies only to the surplus token
   */
  const afterPartnerFees = isSell
    ? {
        sellAmount: afterNetworkCosts.sellAmount,
        buyAmount: afterNetworkCosts.buyAmount - partnerFeeAmount,
      }
    : {
        sellAmount: afterNetworkCosts.sellAmount + partnerFeeAmount,
        buyAmount: afterNetworkCosts.buyAmount,
      }

  return {
    partnerFeeAmount,
    afterPartnerFees,
  }
}
