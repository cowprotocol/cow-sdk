import { applyPercentage } from '../common/utils/math'

export interface SuggestSlippageFromFeeParams {
  /**
   * Fee amount in the sell token returned by the quote
   */
  feeAmount: bigint

  /**
   * The factor to multiply the fee amount by to get the suggested slippage.
   *
   * For example, if the factor is 50% it would calculate which slippage would allow the fee to increase by 50% and still go through.
   */
  multiplyingFactorPercent: number
}

/**
 * Return the absolute slippage in the sell token that would allow the order to execute, even if the fee increases by the multiplying factor percent.
 *
 * @returns The slippage amount in the same units as the fee (sell token amount)
 * @throws Error if feeAmount or multiplyingFactorPercent is negative
 */
export function suggestSlippageFromFee(params: SuggestSlippageFromFeeParams): bigint {
  const { feeAmount, multiplyingFactorPercent } = params

  // Negative fees are not allowed
  if (feeAmount < 0n) {
    throw new Error('Fee amount must be non-negative: ' + feeAmount)
  }

  // Multiplying factor must be a valid percentage
  if (multiplyingFactorPercent < 0) {
    throw new Error('multiplyingFactorPercent must be non-negative: ' + multiplyingFactorPercent)
  }

  // Get the amount we want to account for our slippage
  return applyPercentage(feeAmount, multiplyingFactorPercent)
}
