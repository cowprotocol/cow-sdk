import { getProtocolFeeAmount } from './getProtocolFeeAmount'
import { OrderKind } from '../generated'
import { QuoteAmountsAndCostsParams } from './quoteAmountsAndCosts.types'
import { QuoteAmountsAndCosts } from '../types'
import { getQuoteAmountsAfterPartnerFee } from './getQuoteAmountsAfterPartnerFee'
import { getQuoteAmountsAfterSlippage } from './getQuoteAmountsAfterSlippage'

export function getQuoteAmountsAndCosts(params: QuoteAmountsAndCostsParams): QuoteAmountsAndCosts {
  const { orderParams, slippagePercentBps } = params
  const partnerFeeBps = params.partnerFeeBps ?? 0
  const protocolFeeBps = params.protocolFeeBps ?? 0
  const isSell = orderParams.kind === OrderKind.SELL

  const sellAmount = BigInt(orderParams.sellAmount)
  const buyAmount = BigInt(orderParams.buyAmount)
  const networkCostAmount = BigInt(orderParams.feeAmount)

  // for market orders: reconstruct protocolFee from quote amounts that already have it deducted
  const protocolFeeAmount = getProtocolFeeAmount({
    orderParams,
    protocolFeeBps,
  })

  /**
   * Adding protocolFeeAmount back because API returns amounts baked with the protocol fee
   */
  const beforeAllFees = isSell
    ? {
        sellAmount: sellAmount + networkCostAmount,
        buyAmount: buyAmount + protocolFeeAmount,
      }
    : {
        sellAmount: sellAmount - networkCostAmount - protocolFeeAmount,
        buyAmount: buyAmount,
      }

  /**
   * After protocol fees === before network costs, see explanation in `QuoteAmountsAndCostsParams`
   */
  const afterProtocolFees = isSell
    ? {
        sellAmount: sellAmount + networkCostAmount,
        buyAmount: buyAmount,
      }
    : {
        sellAmount: sellAmount - networkCostAmount,
        buyAmount: buyAmount,
      }

  const afterNetworkCosts = {
    sellAmount: sellAmount,
    buyAmount: buyAmount,
  }

  // get amounts including partner fees
  const { afterPartnerFees, partnerFeeAmount } = getQuoteAmountsAfterPartnerFee({
    afterNetworkCosts,
    beforeAllFees,
    isSell,
    partnerFeeBps,
  })

  // calculate amounts after slippage
  const { afterSlippage } = getQuoteAmountsAfterSlippage({
    afterPartnerFees,
    isSell,
    slippagePercentBps,
  })

  /**
   * For SELL order:
   *  - sellAmount is before all the fees, because settlement contract will subtract network costs from it
   *  - buyAmount is after slippage (and all the fees), because it's the minimum amount we expect to receive
   *
   * For BUY order:
   *  - sellAmount is after slippage (and all the fees), because we increase the amount to cover the fees and potential slippage
   *  - buyAmount is before all the fees, because this is what we expect to receive exactly
   */
  const amountsToSign = isSell
    ? {
        sellAmount: beforeAllFees.sellAmount,
        buyAmount: afterSlippage.buyAmount,
      }
    : {
        sellAmount: afterSlippage.sellAmount,
        buyAmount: beforeAllFees.buyAmount,
      }

  return {
    isSell,
    costs: {
      networkFee: {
        amountInSellCurrency: networkCostAmount,
        amountInBuyCurrency: (buyAmount * networkCostAmount) / sellAmount,
      },
      partnerFee: {
        amount: partnerFeeAmount,
        bps: partnerFeeBps,
      },
      protocolFee: {
        amount: protocolFeeAmount,
        bps: protocolFeeBps,
      },
    },
    beforeAllFees,
    beforeNetworkCosts: afterProtocolFees,
    afterProtocolFees,
    afterNetworkCosts,
    afterPartnerFees,
    afterSlippage,
    amountsToSign,
  }
}
