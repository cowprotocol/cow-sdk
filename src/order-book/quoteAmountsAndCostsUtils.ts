import { QuoteAmountsAndCosts } from './types'
import { OrderKind, type OrderParameters } from './generated'

interface Params {
  orderParams: OrderParameters
  sellDecimals: number
  buyDecimals: number
  slippagePercentBps: number
  partnerFeeBps: number | undefined
}

const ONE_HUNDRED_BPS = BigInt(100 * 100)

export function getQuoteAmountsAndCosts(params: Params): QuoteAmountsAndCosts {
  const { orderParams, sellDecimals, buyDecimals, slippagePercentBps } = params
  const partnerFeeBps = params.partnerFeeBps ?? 0
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
    sellDecimals
  )

  /**
   * Since the quote contains only buy amount after network costs
   * we have to calculate the buy amount before network costs from the quote price
   */
  const buyAmountBeforeNetworkCosts = getBigNumber(quotePrice * sellAmountAfterNetworkCosts.num, buyDecimals)

  /**
   * Partner fee is always added on the surplus amount, for sell-orders it's buy amount, for buy-orders it's sell amount
   */
  const surplusAmount = isSell ? buyAmountBeforeNetworkCosts.big : sellAmountBeforeNetworkCosts.big
  const partnerFeeAmount = partnerFeeBps > 0 ? (surplusAmount * BigInt(partnerFeeBps)) / ONE_HUNDRED_BPS : BigInt(0)

  /**
   * Partner fee is always added on the surplus token, for sell-orders it's buy token, for buy-orders it's sell token
   */
  const afterPartnerFees = isSell
    ? {
        sellAmount: sellAmountAfterNetworkCosts.big,
        buyAmount: buyAmountAfterNetworkCosts.big - partnerFeeAmount,
      }
    : {
        sellAmount: sellAmountAfterNetworkCosts.big + partnerFeeAmount,
        buyAmount: buyAmountAfterNetworkCosts.big,
      }

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
function getBigNumber(value: string | bigint | number, decimals: number): BigNumber {
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
