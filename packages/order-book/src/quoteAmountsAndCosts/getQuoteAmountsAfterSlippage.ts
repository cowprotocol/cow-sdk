import { ONE_HUNDRED_BPS } from './quoteAmountsAndCosts.const'
import { OrderAmountsBig } from './quoteAmountsAndCosts.types'

export function getQuoteAmountsAfterSlippage(params: {
  afterPartnerFees: OrderAmountsBig
  isSell: boolean
  slippagePercentBps: number
}): { afterSlippage: OrderAmountsBig } {
  const { afterPartnerFees, isSell, slippagePercentBps } = params
  const getSlippageAmount = (amount: bigint) => (amount * BigInt(slippagePercentBps)) / ONE_HUNDRED_BPS

  const afterSlippage = isSell
    ? {
        sellAmount: afterPartnerFees.sellAmount,
        buyAmount: afterPartnerFees.buyAmount - getSlippageAmount(afterPartnerFees.buyAmount),
      }
    : {
        sellAmount: afterPartnerFees.sellAmount + getSlippageAmount(afterPartnerFees.sellAmount),
        buyAmount: afterPartnerFees.buyAmount,
      }

  return {
    afterSlippage,
  }
}
