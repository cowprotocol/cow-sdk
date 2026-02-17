import { ONE_HUNDRED_BPS } from './quoteAmountsAndCosts.const'
import { OrderAmountsBig } from './quoteAmountsAndCosts.types'
import { Amounts } from '../types'

export function getQuoteAmountsAfterPartnerFee(params: {
  afterNetworkCosts: Amounts<bigint>
  beforeAllFees: Amounts<bigint>
  isSell: boolean
  partnerFeeBps: number
}): {
  partnerFeeAmount: bigint
  afterPartnerFees: OrderAmountsBig
} {
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
