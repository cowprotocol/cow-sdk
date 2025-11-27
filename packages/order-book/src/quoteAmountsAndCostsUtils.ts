import { QuoteAmountsAndCosts } from './types'
import { OrderKind, type OrderParameters } from './generated'

export interface QuoteAmountsAndCostsParams {
  orderParams: OrderParameters
  sellDecimals: number
  buyDecimals: number
  slippagePercentBps: number
  partnerFeeBps: number | undefined
  protocolFeeBps: number | undefined
}

const ONE_HUNDRED_BPS = BigInt(100 * 100)

export function getQuoteAmountsWithCosts(params: {
  sellDecimals: number
  buyDecimals: number
  orderParams: OrderParameters
  protocolFeeBps?: number
}) {
  const { sellDecimals, buyDecimals, orderParams, protocolFeeBps = 0 } = params

  const isSell = orderParams.kind === OrderKind.SELL

  const protocolFeeAmount = getProtocolFeeAmount({ orderParams, isSell, protocolFeeBps })
  const protocolFeeAmountDecimals = isSell ? buyDecimals : sellDecimals

  const {
    sellAmountAfterNetworkCosts,
    buyAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
    networkCostAmount,
    quotePrice,
    sellAmountBeforeNetworkCosts,
  } = _getQuoteAmountsWithCosts({
    sellDecimals,
    buyDecimals,
    orderParams,
    protocolFeeAmount: getBigNumber(protocolFeeAmount, protocolFeeAmountDecimals),
    isSell,
  })

  return {
    isSell,
    quotePrice,
    sellAmountAfterNetworkCosts: sellAmountAfterNetworkCosts.big,
    buyAmountAfterNetworkCosts: buyAmountAfterNetworkCosts.big,
    buyAmountBeforeNetworkCosts: buyAmountBeforeNetworkCosts.big,
    networkCostAmount: networkCostAmount.big,
    sellAmountBeforeNetworkCosts: sellAmountBeforeNetworkCosts.big,
  }
}

function _getQuoteAmountsWithCosts(params: {
  sellDecimals: number
  buyDecimals: number
  orderParams: OrderParameters
  isSell: boolean
  protocolFeeAmount: BigNumber
}) {
  const { sellDecimals, buyDecimals, orderParams, isSell, protocolFeeAmount } = params
  /**
   * Wrap raw values into bigNumbers
   * We also make amounts names more specific with "beforeNetworkCosts" and "afterNetworkCosts" suffixes
   */
  const networkCostAmount = getBigNumber(orderParams.feeAmount, sellDecimals)
  const sellAmountBeforeNetworkCosts = getBigNumber(orderParams.sellAmount, sellDecimals)
  const buyAmountAfterNetworkCosts = getBigNumber(orderParams.buyAmount, buyDecimals)

  /**
   * This is an actual price of the quote since it's derrived only from the quote sell and buy amounts
   * if protocolFeeBps is 0, this price will be the same
   */
  const quotePrice = isSell
    ? // For SELL order is already deducting protocol fees from buyAmount, so we need to add it back to get the actual price
      (buyAmountAfterNetworkCosts.num + protocolFeeAmount.num) / sellAmountBeforeNetworkCosts.num
    : // For BUY order is already adding protocol fees to sellAmount, so we need to subtract it to get the actual price
      buyAmountAfterNetworkCosts.num / (sellAmountBeforeNetworkCosts.num - protocolFeeAmount.num)

  /**
   * Before amount + networkCosts = After networkCosts :)
   */
  const sellAmountAfterNetworkCosts = getBigNumber(
    sellAmountBeforeNetworkCosts.big + networkCostAmount.big,
    sellDecimals,
  )

  /**
   * Since the quote contains only buy amount after network costs
   * we have to calculate the buy amount before network costs from the quote price
   */
  const buyAmountBeforeNetworkCosts = getBigNumber(quotePrice * sellAmountAfterNetworkCosts.num, buyDecimals)

  return {
    isSell,
    quotePrice,
    networkCostAmount,
    sellAmountBeforeNetworkCosts,
    buyAmountAfterNetworkCosts,
    sellAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
  }
}

function getQuoteAmountsWithPartnerFee(params: {
  sellAmountAfterNetworkCosts: bigint
  buyAmountAfterNetworkCosts: bigint
  buyAmountBeforeProtocolFee: bigint
  sellAmountBeforeProtocolFee: bigint
  isSell: boolean
  partnerFeeBps: number
}) {
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

function getProtocolFeeAmount(params: { orderParams: OrderParameters; isSell: boolean; protocolFeeBps: number }) {
  const { orderParams, protocolFeeBps, isSell } = params
  if (protocolFeeBps <= 0) {
    return 0n
  }

  const { sellAmount: sellAmountStr, buyAmount: buyAmountStr, feeAmount: feeAmountStr } = orderParams
  const sellAmount = BigInt(sellAmountStr)
  const buyAmount = BigInt(buyAmountStr)
  const feeAmount = BigInt(feeAmountStr)

  const protocolFeeBpsBig = BigInt(protocolFeeBps)

  if (isSell) {
    /**
     * SELL orders formula: protocolFeeInBuy = quoteBuyAmount * protocolFeeBps / (1 - protocolFeeBps)
     *
     * The buyAmountAfterNetworkCosts already includes the protocol fee (it was deducted from buyAmount by the API).
     * We need to reconstruct the original buyAmount and calculate the fee amount.
     */
    const denominator = ONE_HUNDRED_BPS - protocolFeeBpsBig
    return (buyAmount * protocolFeeBpsBig) / denominator
  } else {
    /**
     * BUY orders formula: protocolFeeInSell = (quoteSellAmount + feeAmount) * protocolFeeBps / (1 + protocolFeeBps)
     * the sellAmountAfterNetworkCosts already includes the protocol fee (it was added to sellAmount by the API).
     */
    const denominator = ONE_HUNDRED_BPS + protocolFeeBpsBig
    // sellAmountAfterNetworkCosts is already sellAmount + networkCosts (check _getQuoteAmountsWithCosts)
    return ((sellAmount + feeAmount) * protocolFeeBpsBig) / denominator
  }
}

function getQuoteAmountsWithSlippage(params: {
  afterPartnerFees: { sellAmount: bigint; buyAmount: bigint }
  isSell: boolean
  slippagePercentBps: number
}) {
  const { afterPartnerFees, isSell, slippagePercentBps } = params
  const getSlippageAmount = (amount: bigint) => (amount * BigInt(slippagePercentBps)) / ONE_HUNDRED_BPS

  /**
   * Same rules apply for slippage as for partner fees
   */
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
  } = _getQuoteAmountsWithCosts({
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
  const { afterPartnerFees, partnerFeeAmount } = getQuoteAmountsWithPartnerFee({
    sellAmountAfterNetworkCosts: sellAmountAfterNetworkCosts.big,
    buyAmountAfterNetworkCosts: buyAmountAfterNetworkCosts.big,
    buyAmountBeforeProtocolFee,
    sellAmountBeforeProtocolFee,
    isSell,
    partnerFeeBps,
  })

  // calculate amounts after slippage
  const { afterSlippage } = getQuoteAmountsWithSlippage({
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

type BigNumber = {
  big: bigint
  num: number
}

/**
 * BigInt works well with subtraction and addition, but it's not very good with multiplication and division
 * To multiply/divide token amounts we have to convert them to numbers, but we have to be careful with precision
 * @param value
 * @param decimals
 */
export function getBigNumber(value: string | bigint | number, decimals: number): BigNumber {
  if (typeof value === 'number') {
    const bigAsNumber = value * 10 ** decimals
    const bigAsNumberString = bigAsNumber.toFixed()
    const big = BigInt(bigAsNumberString.includes('e') ? bigAsNumber : bigAsNumberString)

    return { big, num: value }
  }

  const big = BigInt(value)
  const num = Number(big) / 10 ** decimals

  return { big, num }
}
