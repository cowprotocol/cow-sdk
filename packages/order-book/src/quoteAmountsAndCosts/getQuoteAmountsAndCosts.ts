import { getProtocolFeeAmount } from './getProtocolFeeAmount'
import { OrderKind } from '../generated'
import { QuoteAmountsAndCostsParams } from './quoteAmountsAndCosts.types'
import { QuoteAmountsAndCosts } from '../types'
import { getQuoteAmountsAfterPartnerFee } from './getQuoteAmountsAfterPartnerFee'
import { getQuoteAmountsAfterSlippage } from './getQuoteAmountsAfterSlippage'

/**
 * Calculates all quote amount stages and costs from a `/quote` API response.
 *
 * Takes the raw order parameters (where protocol fee and network costs are already baked in)
 * and reconstructs every intermediate amount stage: before all fees, after protocol fees,
 * after network costs, after partner fees, and after slippage.
 *
 * The returned {@link QuoteAmountsAndCosts} includes `amountsToSign` — the final sell/buy
 * amounts that should be used when signing the order.
 *
 * @see {@link ./README.md} for a detailed explanation of the fee application order.
 *
 * @param params - Quote parameters including order params, fee BPS values, and slippage.
 * @returns All amount stages, cost breakdowns, and the amounts to sign.
 */
export function getQuoteAmountsAndCosts(params: QuoteAmountsAndCostsParams): QuoteAmountsAndCosts {
  const { orderParams, slippagePercentBps } = params
  const partnerFeeBps = params.partnerFeeBps ?? 0
  const protocolFeeBps = params.protocolFeeBps ?? 0
  const isSell = orderParams.kind === OrderKind.SELL

  const sellAmount = BigInt(orderParams.sellAmount)
  const buyAmount = BigInt(orderParams.buyAmount)
  const networkCostAmount = BigInt(orderParams.feeAmount)
  const networkCostAmountInBuyCurrency = (buyAmount * networkCostAmount) / sellAmount

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
        // Only in case of SELL order, network costs are already added to sellAmount which comes from /quote API
        sellAmount: sellAmount + networkCostAmount,
        /**
         * Important!
         * For SELL orders, /quote API returns sellAmount AFTER network costs
         * buyAmount is correlated to that sellAmount, hence, it doesn't include network costs as well
         * Because of that, we add network costs here as well to have both amounts consistent
         */
        buyAmount: buyAmount + networkCostAmountInBuyCurrency + protocolFeeAmount,
      }
    : {
        sellAmount: sellAmount - protocolFeeAmount,
        buyAmount: buyAmount,
      }

  /**
   * After protocol fees === before network costs, see explanation in `QuoteAmountsAndCostsParams`
   */
  const afterProtocolFees = isSell
    ? {
        sellAmount: beforeAllFees.sellAmount,
        buyAmount: beforeAllFees.buyAmount - protocolFeeAmount,
      }
    : {
        sellAmount: sellAmount,
        buyAmount: beforeAllFees.buyAmount,
      }

  const afterNetworkCosts = isSell
    ? {
        // For SELL order, the /quote API response sellAmount is already after network costs
        // buyAmount is relative to sellAmount, hence it's also after network costs
        sellAmount: sellAmount,
        buyAmount: buyAmount,
      }
    : {
        // For BUY order, the /quote API response sellAmount is only after protocolFee, so we need to add networks costs to the amount
        sellAmount: sellAmount + networkCostAmount,
        buyAmount: afterProtocolFees.buyAmount,
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
    slippageBps: slippagePercentBps,
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
        amountInBuyCurrency: networkCostAmountInBuyCurrency,
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
