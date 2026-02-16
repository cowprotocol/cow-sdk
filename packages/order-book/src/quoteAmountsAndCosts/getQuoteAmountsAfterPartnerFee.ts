import { ONE_HUNDRED_BPS } from './quoteAmountsAndCosts.const'
import { OrderAmountsBig } from './quoteAmountsAndCosts.types'

export function getQuoteAmountsAfterPartnerFee(params: {
  sellAmountAfterNetworkCosts: bigint
  buyAmountAfterNetworkCosts: bigint
  buyAmountBeforeProtocolFee: bigint
  sellAmountBeforeProtocolFee: bigint
  isSell: boolean
  partnerFeeBps: number
}): {
  partnerFeeAmount: bigint
  afterPartnerFees: OrderAmountsBig
} {
  const {
    sellAmountAfterNetworkCosts,
    buyAmountAfterNetworkCosts,
    buyAmountBeforeProtocolFee,
    sellAmountBeforeProtocolFee,
    isSell,
    partnerFeeBps,
  } = params

  const surplusAmountForPartnerFee = isSell ? buyAmountBeforeProtocolFee : sellAmountBeforeProtocolFee
  const partnerFeeAmount =
    partnerFeeBps > 0 ? (surplusAmountForPartnerFee * BigInt(partnerFeeBps)) / ONE_HUNDRED_BPS : BigInt(0)

  // calculate amounts after partner fees
  const afterPartnerFees = isSell
    ? {
        sellAmount: sellAmountAfterNetworkCosts,
        buyAmount: buyAmountAfterNetworkCosts - partnerFeeAmount,
      }
    : {
        sellAmount: sellAmountAfterNetworkCosts + partnerFeeAmount,
        buyAmount: buyAmountAfterNetworkCosts,
      }

  return {
    partnerFeeAmount,
    afterPartnerFees,
  }
}
