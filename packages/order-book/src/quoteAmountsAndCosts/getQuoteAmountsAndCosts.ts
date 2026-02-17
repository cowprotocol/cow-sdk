import { getProtocolFeeAmount } from './getProtocolFeeAmount'
import { OrderKind } from '../generated'
import { QuoteAmountsAndCostsParams } from './quoteAmountsAndCosts.types'
import { QuoteAmountsAndCosts } from '../types'
import { getQuoteAmountsWithNetworkCosts } from './getQuoteAmountsWithNetworkCosts'
import { getQuoteAmountsAfterPartnerFee } from './getQuoteAmountsAfterPartnerFee'
import { getQuoteAmountsAfterSlippage } from './getQuoteAmountsAfterSlippage'

export function getQuoteAmountsAndCosts(params: QuoteAmountsAndCostsParams): QuoteAmountsAndCosts {
  const { orderParams, sellDecimals, buyDecimals, slippagePercentBps } = params
  const partnerFeeBps = params.partnerFeeBps ?? 0
  const protocolFeeBps = params.protocolFeeBps ?? 0
  const isSell = orderParams.kind === OrderKind.SELL

  // for market orders: reconstruct protocolFee from quote amounts that already have it deducted
  const protocolFeeAmount = getProtocolFeeAmount({
    orderParams,
    protocolFeeBps,
  })

  // Get amounts from quote (for market orders, these already include protocolFee deducted)
  const {
    networkCostAmount,
    sellAmountBeforeNetworkCosts,
    buyAmountAfterNetworkCosts,
    sellAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
    quotePriceParams,
  } = getQuoteAmountsWithNetworkCosts({
    sellDecimals,
    buyDecimals,
    orderParams,
    protocolFeeBps,
  })

  /**
   * Adding protocolFeeAmount back because API returns amounts baked with the protocol fee
   */
  const beforeAllFees = isSell
    ? /**
       * Protocol fee is always applied to the surplus token
       */
      {
        sellAmount: sellAmountBeforeNetworkCosts,
        buyAmount: buyAmountBeforeNetworkCosts + protocolFeeAmount,
      }
    : {
        sellAmount: sellAmountBeforeNetworkCosts - protocolFeeAmount,
        buyAmount: buyAmountBeforeNetworkCosts,
      }

  /**
   * After protocol fees === before network costs, see explanation in `QuoteAmountsAndCostsParams`
   */
  const afterProtocolFees = isSell
    ? {
        sellAmount: sellAmountBeforeNetworkCosts,
        buyAmount: buyAmountBeforeNetworkCosts,
      }
    : {
        sellAmount: sellAmountBeforeNetworkCosts,
        buyAmount: buyAmountBeforeNetworkCosts,
      }

  const afterNetworkCosts = {
    sellAmount: sellAmountAfterNetworkCosts,
    buyAmount: buyAmountAfterNetworkCosts,
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
        amountInBuyCurrency: (quotePriceParams.numerator * networkCostAmount) / quotePriceParams.denominator,
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
