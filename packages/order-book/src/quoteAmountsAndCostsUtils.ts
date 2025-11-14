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
}) {
  const { sellDecimals, buyDecimals, orderParams } = params

  const {
    sellAmountAfterNetworkCosts,
    buyAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
    isSell,
    networkCostAmount,
    quotePrice,
    sellAmountBeforeNetworkCosts,
  } = _getQuoteAmountsWithCosts({ sellDecimals, buyDecimals, orderParams })

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
}) {
  const { sellDecimals, buyDecimals, orderParams } = params
  const isSell = orderParams.kind === OrderKind.SELL
  /**
   * Wrap raw values into bigNumbers
   * We also make amounts names more specific with "beforeNetworkCosts" and "afterNetworkCosts" suffixes
   */
  const networkCostAmount = getBigNumber(orderParams.feeAmount, sellDecimals)
  const sellAmountBeforeNetworkCosts = getBigNumber(orderParams.sellAmount, sellDecimals)
  const buyAmountAfterNetworkCosts = getBigNumber(orderParams.buyAmount, buyDecimals)

  /**
   * This is an actual price of the quote since it's derrived only from the quote sell and buy amounts
   */
  const quotePrice = buyAmountAfterNetworkCosts.num / sellAmountBeforeNetworkCosts.num

  /**
   * Before networkCosts + networkCosts = After networkCosts :)
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
  buyAmountBeforeNetworkCosts: bigint
  sellAmountBeforeNetworkCosts: bigint
  isSell: boolean
  partnerFeeBps: number
}) {
  const {
    sellAmountAfterNetworkCosts,
    buyAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
    sellAmountBeforeNetworkCosts,
    isSell,
    partnerFeeBps,
  } = params

  /**
   * Partner fee is always added on the surplus amount, for sell-orders it's buy amount, for buy-orders it's sell amount
   */
  const surplusAmount = isSell ? buyAmountBeforeNetworkCosts : sellAmountBeforeNetworkCosts
  const partnerFeeAmount = partnerFeeBps > 0 ? (surplusAmount * BigInt(partnerFeeBps)) / ONE_HUNDRED_BPS : 0n

  /**
   * Partner fee is always added on the surplus token, for sell-orders it's buy token, for buy-orders it's sell token
   */
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

function getProtocolFeeAmount(params: {
  sellAmountAfterNetworkCosts: bigint
  buyAmountAfterNetworkCosts: bigint
  networkCostAmount: bigint
  isSell: boolean
  protocolFeeBps: number
}) {
  const { sellAmountAfterNetworkCosts, buyAmountAfterNetworkCosts, networkCostAmount, isSell, protocolFeeBps } = params

  if (protocolFeeBps <= 0) {
    return 0n
  }

  const protocolFeeBpsBig = BigInt(protocolFeeBps)

  if (isSell) {
    /**
     * SELL orders formula: protocolFeeInBuy = quoteBuyAmount * protocolFeeBps / (1 - protocolFeeBps)
     *
     * The buyAmountAfterNetworkCosts already includes the protocol fee (it was deducted from buyAmount by the API).
     * We need to reconstruct the original buyAmount and calculate the fee amount.
     */
    const ONE_MINUS_PROTOCOL_FEE_BPS = ONE_HUNDRED_BPS - protocolFeeBpsBig
    return (buyAmountAfterNetworkCosts * protocolFeeBpsBig) / ONE_MINUS_PROTOCOL_FEE_BPS
  } else {
    /**
     * BUY orders formula: protocolFeeInSell = (quoteSellAmount + feeAmount) * proto colFeeBps  / (1 + protocolFeeBps)
     */
    const ONE_PLUS_PROTOCOL_FEE_BPS = ONE_HUNDRED_BPS + protocolFeeBpsBig
    const sellAmountWithNetworkFee = sellAmountAfterNetworkCosts + networkCostAmount
    return (sellAmountWithNetworkFee * protocolFeeBpsBig) / ONE_PLUS_PROTOCOL_FEE_BPS
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

  // Get amounts including network costs
  const {
    isSell,
    networkCostAmount,
    sellAmountBeforeNetworkCosts,
    buyAmountAfterNetworkCosts,
    sellAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
    quotePrice,
  } = _getQuoteAmountsWithCosts({ sellDecimals, buyDecimals, orderParams })


  const protocolFeeAmount = getProtocolFeeAmount({
    sellAmountAfterNetworkCosts: sellAmountAfterNetworkCosts.big,
    buyAmountAfterNetworkCosts: buyAmountAfterNetworkCosts.big,
    networkCostAmount: networkCostAmount.big,
    isSell,
    protocolFeeBps,
  })

  // Get amounts including partner fees
  const { afterPartnerFees, partnerFeeAmount } = getQuoteAmountsWithPartnerFee({
    sellAmountAfterNetworkCosts: sellAmountAfterNetworkCosts.big,
    buyAmountAfterNetworkCosts: buyAmountAfterNetworkCosts.big,
    buyAmountBeforeNetworkCosts: buyAmountBeforeNetworkCosts.big,
    sellAmountBeforeNetworkCosts: sellAmountBeforeNetworkCosts.big,
    isSell,
    partnerFeeBps,
  })

  // Get amounts including slippage
  const { afterSlippage } = getQuoteAmountsWithSlippage({
    afterPartnerFees,
    isSell,
    slippagePercentBps,
  })

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
    beforeNetworkCosts: {
      sellAmount: sellAmountBeforeNetworkCosts.big,
      buyAmount: buyAmountBeforeNetworkCosts.big,
    },
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
