import { applyPercentage } from '../common/utils/math'

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

  // Negative sell amounts are not allowed
  if (sellAmount <= 0n) {
    throw new Error('sellAmount must be greater than 0: ' + sellAmount)
  }

  // Slippage percentage must be non-negative
  if (slippagePercent < 0) {
    throw new Error('slippagePercent must be non-negative: ' + slippagePercent)
  }

  return applyPercentage(sellAmount, slippagePercent)
}
