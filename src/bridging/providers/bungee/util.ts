import { BungeeQuoteResult } from './BungeeBridgeProvider'
import { TargetChainId } from 'src/chains'
import { BUNGEE_TOKEN_MAPPING } from './const/tokens'
import { BungeeChainConfig } from './const/tokens'
import { QuoteBridgeRequest } from 'src/bridging/types'

export function getChainConfigs(
  sourceChainId: TargetChainId,
  targetChainId: TargetChainId,
): { sourceChainConfig: BungeeChainConfig; targetChainConfig: BungeeChainConfig } | undefined {
  const sourceChainConfig = getChainConfig(sourceChainId)
  const targetChainConfig = getChainConfig(targetChainId)

  if (!sourceChainConfig || !targetChainConfig) return

  return { sourceChainConfig, targetChainConfig }
}

function getChainConfig(chainId: number): BungeeChainConfig | undefined {
  return BUNGEE_TOKEN_MAPPING[chainId as unknown as TargetChainId]
}

export function getTokenSymbol(tokenAddress: string, chainConfig: BungeeChainConfig): string | undefined {
  return Object.keys(chainConfig.tokens).find((key) => chainConfig.tokens[key] === tokenAddress)
}

export function getTokenAddress(tokenSymbol: string, chainConfig: BungeeChainConfig): string | undefined {
  return chainConfig.tokens[tokenSymbol]
}

/**
 * Convert a QuoteBridgeRequest to a BungeeQuoteResult
 * @param request - The QuoteBridgeRequest to convert
 * @returns The BungeeQuoteResult
 */
export function toBridgeQuoteResult(request: QuoteBridgeRequest): BungeeQuoteResult {
  // TODO implement
  throw new Error('TODO implement')
}
