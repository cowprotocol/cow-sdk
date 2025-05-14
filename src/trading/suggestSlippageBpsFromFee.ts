import { applyPercentage, percentageToBps } from 'src/common/utils/math'

const MIN_SLIPPAGE_BPS = 50
const MAX_SLIPPAGE_BPS = 10_000 // 100% (this is)

const SCALE = 10n ** 18n // 18 decimal places of precision. Used to avoid depending on Big Decimal libraries

export interface SuggestSlippageBpsFromFeeParams {
  /**
   * Fee amount in the sell token returned by the quote
   */
  feeAmount: bigint

  /**
   * Actual amount to be sold
   *
   * For sell orders, its expected the sell amount after applying the fee is applied
   * For buy orders, its expected to be the sell amount before the fee is applied
   */
  sellAmount: bigint

  /**
   * Whether the order is a sell order or a buy order
   */
  isSell: boolean

  /**
   * The factor to multiply the fee amount by to get the suggested slippage.
   *
   * For example, if the factor is 50% it would calculate which slippage would allow the fee to increase by 50% and still go through.
   */
  multiplyingFactorPercent: number
}

/**
 * Return the slippage in BPS that would allow the fee to increase by the multiplying factor percent.
 *
 * If the fees are bigger or equal to the sell amount, it returns the 10_000 BPS (100% slippage).
 */
export function suggestSlippageBpsFromFee(params: SuggestSlippageBpsFromFeeParams): number {
  const slippagePercent = suggestSlippagePercent(params)
  const slippageBps = percentageToBps(slippagePercent)

  return Math.max(Math.min(slippageBps, MAX_SLIPPAGE_BPS), MIN_SLIPPAGE_BPS)
}

export function suggestSlippagePercent(params: SuggestSlippageBpsFromFeeParams): number {
  const { feeAmount, sellAmount, isSell, multiplyingFactorPercent } = params

  // Negative fees are not allowed
  if (feeAmount < 0n) {
    throw new Error('Fee amount cannot be negative: ' + feeAmount)
  }

  // Multiplying factor must be a valid percentage
  if (multiplyingFactorPercent < 0n) {
    throw new Error('multiplyingFactorPercent must be a percentage: ' + multiplyingFactorPercent)
  }

  // Get the amount we want to account for our slippage
  const feeAfterIncrease = applyPercentage(feeAmount, 100 + multiplyingFactorPercent)

  // Account fee (fee is deducted to sell amount for sell orders and added to sell amount for buy orders)
  const sellAmountAccountingFee = isSell ? sellAmount - feeAmount : sellAmount + feeAmount

  // Return maximum slippage if the sellAmount after accounting for the fee is 0 or negative
  if (sellAmountAccountingFee <= 0n) {
    return MAX_SLIPPAGE_BPS
  }

  if (isSell) {
    // For sell orders:
    // 1 - ((sellAmount - feeAmount * multiplier) / (sellAmount - feeAmount))
    // i.e: feeAmount=5, sellAmount=100, multiplier=1.5
    //    suggestSlippageBpsFromFee = 1 - (100-5*1.5) / (100-5) = 0.02631578947
    //    suggestSlippageBpsFromFee (in scale) = 1e18 - (1e18*(100-5*1.5)) / (100-5) = 26,315,789,473,684,210
    //    suggestSlippageBpsFromFee = 26,315,789,473,684,210 / 1e18 = 0.02631578947
    const percentageInScale = SCALE - (SCALE * (sellAmount - feeAfterIncrease)) / sellAmountAccountingFee

    return Number(percentageInScale) / Number(SCALE)
  } else {
    // For buy orders:
    // ((sellAmount + feeAmount * feeMultiplierFactor) / (sellAmount + feeAmount)) - 1
    // i.e: feeAmount=5, sellAmount=100, multiplier=1.5
    //    suggestSlippageBpsFromFee = (100+5*1.5) / (100+5) - 1 = 0.02380952381
    //    suggestSlippageBpsFromFee (in scale) = (1e18*(100+5*1.5)) / (100+5) - 1e18 = 23,809,523,809,523,809
    //    suggestSlippageBpsFromFee = 23,809,523,809,523,809 / 1e18 = 0.02380952381
    const percentageInScale = (SCALE * (sellAmount + feeAfterIncrease)) / sellAmountAccountingFee - SCALE

    return Number(percentageInScale) / Number(SCALE)
  }
}
