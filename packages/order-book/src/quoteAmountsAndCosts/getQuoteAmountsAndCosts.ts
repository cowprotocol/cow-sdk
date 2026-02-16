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

  // restore amounts before protocolFee (but after network costs)
  // this is needed because partnerFee should be calculated from amounts with protocolFee (for the same volume)
  // for sell orders: protocolFee was deducted from buyAmount, so we add it back
  // for buy orders: protocolFee was added to sellAmount, so we subtract it
  // if protocolFeeBps is 0, use buyAmountBeforeNetworkCosts (calculated from quotePrice)
  const buyAmountBeforeProtocolFee = isSell
    ? protocolFeeBps > 0
      ? buyAmountAfterNetworkCosts + protocolFeeAmount
      : buyAmountBeforeNetworkCosts
    : buyAmountAfterNetworkCosts
  const sellAmountBeforeProtocolFee = isSell
    ? sellAmountAfterNetworkCosts
    : protocolFeeBps > 0
      ? sellAmountAfterNetworkCosts - protocolFeeAmount
      : sellAmountBeforeNetworkCosts

  // get amounts including partner fees
  const { afterPartnerFees, partnerFeeAmount } = getQuoteAmountsAfterPartnerFee({
    sellAmountAfterNetworkCosts,
    buyAmountAfterNetworkCosts,
    buyAmountBeforeProtocolFee,
    sellAmountBeforeProtocolFee,
    isSell,
    partnerFeeBps,
  })

  // calculate amounts after slippage
  const { afterSlippage } = getQuoteAmountsAfterSlippage({
    afterPartnerFees,
    isSell,
    slippagePercentBps,
  })

  // restore beforeNetworkCosts (amounts before network costs, but with protocol fee restored)
  // for sell orders: buyAmount needs protocolFee added back (use buyAmountBeforeProtocolFee)
  // for buy orders: sellAmount needs protocolFee subtracted (use sellAmountBeforeProtocolFee)
  const beforeNetworkCosts = isSell
    ? {
        sellAmount: sellAmountBeforeNetworkCosts,
        buyAmount: buyAmountBeforeProtocolFee,
      }
    : {
        sellAmount: sellAmountBeforeProtocolFee,
        buyAmount: buyAmountBeforeNetworkCosts,
      }

  const beforeAllFees = isSell
    ? {
        sellAmount: sellAmountBeforeNetworkCosts,
        buyAmount: buyAmountBeforeNetworkCosts,
      }
    : {
        sellAmount: sellAmountBeforeNetworkCosts - protocolFeeAmount,
        buyAmount: buyAmountBeforeNetworkCosts,
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
    beforeNetworkCosts,
    beforeAllFees,
    afterNetworkCosts: {
      sellAmount: sellAmountAfterNetworkCosts,
      buyAmount: buyAmountAfterNetworkCosts,
    },
    afterPartnerFees,
    afterSlippage,
  }
}
