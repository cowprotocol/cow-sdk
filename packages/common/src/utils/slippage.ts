import { applyPercentage, percentageToBps } from './math'

const SCALE = 10n ** 6n // 6 decimal places of precision. Used to avoid depending on Big Decimal libraries

const MAX_SLIPPAGE_BPS = 10_000 // 100% in BPS (max slippage)

const SLIPPAGE_FEE_MULTIPLIER_PERCENT = 50 // Account for 50% fee increase
const SLIPPAGE_VOLUME_MULTIPLIER_PERCENT = 0.5 // Account for 0.5% volume as slippage

/**
 * Get the slippage percentage for a given absolute slippage.
 *
 * Returns a percentage as a portion of 1 with 6 decimals of precision.
 *
 * @param params
 * @returns
 */
export function getSlippagePercent(params: {
  isSell: boolean
  sellAmountBeforeNetworkCosts: bigint
  sellAmountAfterNetworkCosts: bigint
  slippage: bigint
}): number {
  const { sellAmountBeforeNetworkCosts, sellAmountAfterNetworkCosts, slippage, isSell } = params

  const sellAmount = isSell ? sellAmountAfterNetworkCosts : sellAmountBeforeNetworkCosts

  // Check that the sellAmount after accounting for the fee is not negative
  if (sellAmount <= 0n) {
    throw new Error('sellAmount must be greater than 0: ' + sellAmount)
  }

  if (slippage < 0n) {
    throw new Error('slippage must be non-negative: ' + slippage)
  }

  if (isSell) {
    // For sell orders:
    // 1 - (sellAmount - slippage) / sellAmount
    // i.e: sellAmount=100, slippage=20
    //    slippagePercent = 1 - (100-20) / 100 = 0.2
    //    slippagePercent (in scale) = 1e6 - (1e6*(100-20)) / 100 = 200,000
    //    slippagePercent = 200,000 / 1e6 = 0.2
    const percentageInScale = SCALE - (SCALE * (sellAmount - slippage)) / sellAmount

    return Number(percentageInScale) / Number(SCALE)
  } else {
    // For buy orders:
    // ((sellAmount + slippage) / sellAmount) - 1
    // i.e: feeAmount=5, sellAmount=100, slippage=20
    //    slippagePercent = (100+20) / 100 - 1 = 0.2
    //    slippagePercent (in scale) = (1e6*(100+20)) / 100 - 1e6 = 200,000
    //    slippagePercent = 200,000 / 1e6 = 0.2
    const percentageInScale = (SCALE * (sellAmount + slippage)) / sellAmount - SCALE

    return Number(percentageInScale) / Number(SCALE)
  }
}

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

export interface SuggestSlippageBpsParams {
  isSell: boolean
  /**
   * Fee amount in the sell token, as returned by the quote.
   */
  feeAmount: bigint
  sellAmountBeforeNetworkCosts: bigint
  sellAmountAfterNetworkCosts: bigint
  /**
   * Floor for the returned suggestion — e.g. a chain's eth-flow minimum. Defaults to 0.
   */
  lowerCapBps?: number
  volumeMultiplierPercent?: number
}

/**
 * Return the slippage in BPS that would allow the fee to increase by the multiplying factor percent.
 */
export function suggestSlippageBps(params: SuggestSlippageBpsParams): number {
  const {
    isSell,
    feeAmount,
    sellAmountBeforeNetworkCosts,
    sellAmountAfterNetworkCosts,
    lowerCapBps = 0,
    volumeMultiplierPercent = SLIPPAGE_VOLUME_MULTIPLIER_PERCENT,
  } = params

  const slippageBpsFromFee = suggestSlippageFromFee({
    feeAmount,
    multiplyingFactorPercent: SLIPPAGE_FEE_MULTIPLIER_PERCENT,
  })

  const slippageBpsFromVolume = suggestSlippageFromVolume({
    isSell,
    sellAmountBeforeNetworkCosts,
    sellAmountAfterNetworkCosts,
    slippagePercent: volumeMultiplierPercent,
  })

  const totalSlippageBps = slippageBpsFromFee + slippageBpsFromVolume

  const slippagePercent = getSlippagePercent({
    isSell,
    sellAmountBeforeNetworkCosts,
    sellAmountAfterNetworkCosts,
    slippage: totalSlippageBps,
  })

  const slippageBps = percentageToBps(slippagePercent)

  return Math.max(Math.min(slippageBps, MAX_SLIPPAGE_BPS), lowerCapBps)
}
