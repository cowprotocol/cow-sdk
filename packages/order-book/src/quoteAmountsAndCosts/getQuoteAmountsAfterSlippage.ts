import { ONE_HUNDRED_BPS } from './quoteAmountsAndCosts.const'
import { OrderAmountsBig } from './quoteAmountsAndCosts.types'

export interface QuoteAmountsAfterSlippageParams {
  afterPartnerFees: OrderAmountsBig
  isSell: boolean
  slippageBps: number
}

export interface QuoteAmountsAfterSlippage {
  afterSlippage: OrderAmountsBig
}

/**
 * Applies slippage tolerance to the quote amounts after all fees have been applied.
 *
 * Slippage protects the user from price movements between quoting and execution.
 * It is always applied to the non-fixed (surplus) side of the order:
 *
 * - **SELL orders:** slippage reduces `buyAmount` (user accepts receiving less)
 * - **BUY orders:** slippage increases `sellAmount` (user accepts paying more)
 *
 * @param params.afterPartnerFees - Amounts after partner fees have been applied.
 * @param params.isSell - Whether this is a sell order.
 * @param params.slippageBps - Slippage tolerance in basis points.
 * @returns The adjusted amounts after slippage tolerance.
 */
export function getQuoteAmountsAfterSlippage(params: QuoteAmountsAfterSlippageParams): QuoteAmountsAfterSlippage {
  const { afterPartnerFees, isSell, slippageBps } = params
  const getSlippageAmount = (amount: bigint) => (amount * BigInt(slippageBps)) / ONE_HUNDRED_BPS

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
