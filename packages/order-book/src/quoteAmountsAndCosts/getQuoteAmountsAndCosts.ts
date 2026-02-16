import { getProtocolFeeAmount } from './getProtocolFeeAmount'
import { OrderKind } from '../generated'
import { QuoteAmountsAndCostsParams } from './quoteAmountsAndCosts.types'
import { QuoteAmountsAndCosts } from '../types'
import { getBigNumber } from './quoteAmountsAndCosts.utils'
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
    isSell,
    protocolFeeBps,
  })
  const protocolFeeAmountDecimals = isSell ? buyDecimals : sellDecimals

  // Get amounts from quote (for market orders, these already include protocolFee deducted)
  const {
    networkCostAmount,
    sellAmountBeforeNetworkCosts,
    buyAmountAfterNetworkCosts,
    sellAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
    quotePrice,
  } = getQuoteAmountsWithNetworkCosts({
    sellDecimals,
    buyDecimals,
    orderParams,
    isSell,
    protocolFeeAmount: getBigNumber(protocolFeeAmount, protocolFeeAmountDecimals),
  })

  // restore amounts before protocolFee (but after network costs)
  // this is needed because partnerFee should be calculated from amounts with protocolFee (for the same volume)
  // for sell orders: protocolFee was deducted from buyAmount, so we add it back
  // for buy orders: protocolFee was added to sellAmount, so we subtract it
  // if protocolFeeBps is 0, use buyAmountBeforeNetworkCosts (calculated from quotePrice)
  const buyAmountBeforeProtocolFee = isSell
    ? protocolFeeBps > 0
      ? buyAmountAfterNetworkCosts.big + protocolFeeAmount
      : buyAmountBeforeNetworkCosts.big
    : buyAmountAfterNetworkCosts.big
  const sellAmountBeforeProtocolFee = isSell
    ? sellAmountAfterNetworkCosts.big
    : protocolFeeBps > 0
      ? sellAmountAfterNetworkCosts.big - protocolFeeAmount
      : sellAmountBeforeNetworkCosts.big

  // get amounts including partner fees
  const { afterPartnerFees, partnerFeeAmount } = getQuoteAmountsAfterPartnerFee({
    sellAmountAfterNetworkCosts: sellAmountAfterNetworkCosts.big,
    buyAmountAfterNetworkCosts: buyAmountAfterNetworkCosts.big,
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
        sellAmount: sellAmountBeforeNetworkCosts.big,
        buyAmount: buyAmountBeforeProtocolFee,
      }
    : {
        sellAmount: sellAmountBeforeProtocolFee,
        buyAmount: buyAmountBeforeNetworkCosts.big,
      }

  const beforeAllFees = isSell
    ? {
        sellAmount: sellAmountBeforeNetworkCosts.big,
        buyAmount: buyAmountBeforeNetworkCosts.big,
      }
    : {
        sellAmount: sellAmountBeforeNetworkCosts.big - protocolFeeAmount,
        buyAmount: buyAmountBeforeNetworkCosts.big,
      }

  return {
    isSell,
    costs: {
      networkFee: {
        amountInSellCurrency: networkCostAmount.big,
        amountInBuyCurrency: getBigNumber(quotePrice * networkCostAmount.num, buyDecimals).big,
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
      sellAmount: sellAmountAfterNetworkCosts.big,
      buyAmount: buyAmountAfterNetworkCosts.big,
    },
    afterPartnerFees,
    afterSlippage,
  }
}
