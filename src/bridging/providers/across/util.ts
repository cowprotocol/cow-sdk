import { TargetChainId } from '../../../chains'
import { SuggestedFeesResponse } from './AcrossApi'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { AcrossChainConfig, acrossTokenMapping } from './const/tokens'

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
  return Object.values(acrossTokenMapping).find((config) => config.chainId === chainId)
}

export function getTokenSymbol(tokenAddress: string, chainConfig: AcrossChainConfig): string | undefined {
  return Object.keys(chainConfig.tokens).find((key) => chainConfig.tokens[key] === tokenAddress)
}

export function getTokenAddress(tokenSymbol: string, chainConfig: AcrossChainConfig): string | undefined {
  return chainConfig.tokens[tokenSymbol as keyof AcrossChainConfig] as string | undefined
}

export function toBridgeQuoteResult(amount: string, suggestedFees: SuggestedFeesResponse): AcrossQuoteResult {
  // TODO: Do we need to use all the other fees, or they are included in totalRelayFee? I know 'lpFee' fee is, as stated in the docs, but not sure about the others.
  // const relayerCapitalFee = suggestedFees.relayerCapitalFee
  // const relayerGasFee = suggestedFees.relayerGasFee
  // const lpFee = suggestedFees.lpFee

  return {
    suggestedFees,
    buyAmount: applyFee(amount, suggestedFees.totalRelayFee.pct),
    feeBps: pctToBps(suggestedFees.totalRelayFee.pct),
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
export function pctToBps(pct: string): number {
  const pctBigInt = BigInt(pct)
  return Number((pctBigInt * 10_000n) / 10n ** 18n)
}

export function applyFee(amount: string, pct: string): string {
  const amountBigInt = BigInt(amount)
  const pctBigInt = BigInt(pct)

  // Compute amount after fee: amount * (1 - pct / 1e18)
  const amountAfterFee = (amountBigInt * (10n ** 18n - pctBigInt)) / 10n ** 18n

  return amountAfterFee.toString()
}
