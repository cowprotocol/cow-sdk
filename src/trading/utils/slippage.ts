const SCALE = 10n ** 6n // 6 decimal places of precision. Used to avoid depending on Big Decimal libraries

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
  if (sellAmount < 0n) {
    throw new Error('sellAmount must be non-negative: ' + sellAmount)
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
