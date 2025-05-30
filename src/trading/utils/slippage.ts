import { SupportedChainId } from 'src/chains'
import { getIsEthFlowOrder } from './misc'

const SCALE = 10n ** 6n // 6 decimal places of precision. Used to avoid depending on Big Decimal libraries
const DEFAULT_SLIPPAGE_BPS = 50 // 0.5%

const ETH_FLOW_DEFAULT_SLIPPAGE_BPS: Record<SupportedChainId, number> = {
  [SupportedChainId.MAINNET]: 200, // 2%,
  [SupportedChainId.ARBITRUM_ONE]: 50, // 0.5%,
  [SupportedChainId.BASE]: 50, // 0.5%,
  [SupportedChainId.GNOSIS_CHAIN]: 50, // 0.5%,
  [SupportedChainId.SEPOLIA]: 50, // 0.5%,
  [SupportedChainId.POLYGON]: 50, // 0.5%,
  [SupportedChainId.AVALANCHE]: 50, // 0.5%,
}

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

export function getDefaultSlippageBps(chainId: SupportedChainId, isEthFlowOrder: boolean): number

export function getDefaultSlippageBps(chainId: SupportedChainId, sellToken: string): number

export function getDefaultSlippageBps(chainId: SupportedChainId, isEthFlowOrSellToken: boolean | string): number {
  const isEthFlow =
    typeof isEthFlowOrSellToken === 'boolean'
      ? isEthFlowOrSellToken
      : getIsEthFlowOrder({ sellToken: isEthFlowOrSellToken })

  if (isEthFlow) {
    return ETH_FLOW_DEFAULT_SLIPPAGE_BPS[chainId]
  } else {
    return DEFAULT_SLIPPAGE_BPS
  }
}
