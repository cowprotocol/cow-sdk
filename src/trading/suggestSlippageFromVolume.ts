import { applyPercentage } from 'src/common/utils/math'

export interface SuggestSlippageFromVolumeParams {
  sellAmountBeforeNetworkCosts: bigint
  sellAmountAfterNetworkCosts: bigint
  isSell: boolean
  slippagePercent: number
}

/**
 * Return the absolute slippage in sell token for the traded amount
 */
export function suggestSlippageFromVolume(params: SuggestSlippageFromVolumeParams): bigint {
  const { sellAmountBeforeNetworkCosts, sellAmountAfterNetworkCosts, isSell, slippagePercent } = params

  const sellAmount = isSell ? sellAmountAfterNetworkCosts : sellAmountBeforeNetworkCosts

  // Negative fees are not allowed
  if (sellAmount < 0n) {
    throw new Error('sellAmount cannot be negative: ' + sellAmount)
  }

  // Multiplying factor must be a valid percentage
  if (slippagePercent < 0) {
    throw new Error('slippagePercent must be a positive: ' + slippagePercent)
  }

  return applyPercentage(sellAmount, slippagePercent)
}
