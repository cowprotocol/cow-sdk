import { TargetChainId } from '../../../chains'
import { SuggestedFeesResponse } from './AcrossApi'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { AcrossChainConfig, ACROSS_TOKEN_MAPPING } from './const/tokens'

const PCT_100_PERCENT = 10n ** 18n

export function getChainConfigs(
  sourceChainId: TargetChainId,
  targetChainId: TargetChainId
): { sourceChainConfig: AcrossChainConfig; targetChainConfig: AcrossChainConfig } | undefined {
  const sourceChainConfig = getChainConfig(sourceChainId)
  const targetChainConfig = getChainConfig(targetChainId)

  if (!sourceChainConfig || !targetChainConfig) return

  return { sourceChainConfig, targetChainConfig }
}

function getChainConfig(chainId: number): AcrossChainConfig | undefined {
  return ACROSS_TOKEN_MAPPING[chainId as unknown as TargetChainId]
}

export function getTokenSymbol(tokenAddress: string, chainConfig: AcrossChainConfig): string | undefined {
  return Object.keys(chainConfig.tokens).find((key) => chainConfig.tokens[key] === tokenAddress)
}

export function getTokenAddress(tokenSymbol: string, chainConfig: AcrossChainConfig): string | undefined {
  return chainConfig.tokens[tokenSymbol]
}

export function toBridgeQuoteResult(amount: bigint, suggestedFees: SuggestedFeesResponse): AcrossQuoteResult {
  // TODO: Do we need to use all the other fees, or they are included in totalRelayFee? I know 'lpFee' fee is, as stated in the docs, but not sure about the others.
  // const relayerCapitalFee = suggestedFees.relayerCapitalFee
  // const relayerGasFee = suggestedFees.relayerGasFee
  // const lpFee = suggestedFees.lpFee

  const pct = BigInt(suggestedFees.totalRelayFee.pct)
  return {
    suggestedFees,
    buyAmount: applyFee(amount, pct),
    feeBps: pctToBps(pct),
    slippageBps: 0, // TODO: Can I set slippage to zero? are quotes enforced?
  }
}

/**
 * pct is a string that represents a percentage.
 *
 * Note: 1% is represented as 1e16, 100% is 1e18, 50% is 5e17, etc. These values are in the same format that the contract understands.
 *
 * Bps is a percentage in basis points (1/100th of a percent). For example, 1% is 100 bps.
 *
 */
export function pctToBps(pct: bigint): number {
  return Number((pct * 10_000n) / PCT_100_PERCENT)
}

export function applyFee(amount: bigint, pct: bigint): bigint {
  if (pct > PCT_100_PERCENT) {
    throw new Error('Fee cannot exceed 100%')
  }

  // Compute amount after fee: amount * (1 - pct / 1e18)
  const amountAfterFee = (amount * (PCT_100_PERCENT - pct)) / PCT_100_PERCENT

  return amountAfterFee
}
