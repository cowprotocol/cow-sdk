import { SupportedChainId } from '../../../chains'
import { AcrossChainConfig, acrossTokenMapping } from './const/tokens'

const ACROSS_API_URL = 'https://app.across.to/api'

export type AcrossQuoteRequest = {
  originChainId: number
  destinationChainId: number
  inputToken: string
  outputToken: string
}

export async function getAcrossQuote(
  params: AcrossQuoteRequest,
  inputAmount: bigint,
  recipient: string,
  { apiBaseUrl = ACROSS_API_URL }: { apiBaseUrl?: string }
) {
  const { inputToken, originChainId, destinationChainId } = params
  const url = `${ACROSS_API_URL}/suggested-fees?token=${inputToken}&originChainId=${originChainId}&destinationChainId=${destinationChainId}&amount=${inputAmount}&recipient=${recipient}`

  return fetch(url).then((res) => res.json())
}

export function getOutputTokenFromIntermediateToken(params: {
  sourceChain: SupportedChainId
  intermediateTokenAddress: string
  destinationChain: number
}): string | undefined {
  const { intermediateTokenAddress, sourceChain, destinationChain } = params
  const chainConfigs = getChainConfigs(sourceChain, destinationChain)
  if (!chainConfigs) return

  const { sourceChainConfig, targetChainConfig } = chainConfigs

  // Find the token symbol for the intermediate token
  const intermediateTokenSymbol = getTokenSymbol(intermediateTokenAddress, sourceChainConfig)
  if (!intermediateTokenSymbol) return

  // Use the tokenSymbol to find the outputToken in the target chain
  return getTokenAddress(intermediateTokenSymbol, targetChainConfig)
}

export function getIntermediateTokenFromTargetToken(params: {
  sourceChain: SupportedChainId
  targetToken: string
  targetChain: number
}): string | undefined {
  const { sourceChain, targetToken, targetChain } = params
  const chainConfigs = getChainConfigs(sourceChain, targetChain)
  if (!chainConfigs) return

  const { sourceChainConfig, targetChainConfig } = chainConfigs

  // Find the token symbol for the target token
  const targetTokenSymbol = getTokenSymbol(targetToken, targetChainConfig)
  if (!targetTokenSymbol) return

  // Use the tokenSymbol to find the outputToken in the target chain
  return getTokenAddress(targetTokenSymbol, sourceChainConfig)
}
function getTokenSymbol(tokenAddress: string, chainConfig: AcrossChainConfig): string | undefined {
  return Object.keys(chainConfig).find((key) => chainConfig[key as keyof AcrossChainConfig] === tokenAddress)
}

function getTokenAddress(tokenSymbol: string, chainConfig: AcrossChainConfig): string | undefined {
  return chainConfig[tokenSymbol as keyof AcrossChainConfig] as string | undefined
}

function getChainConfigs(
  sourceChainId: SupportedChainId,
  targetChainId: SupportedChainId
): { sourceChainConfig: AcrossChainConfig; targetChainConfig: AcrossChainConfig } | undefined {
  const sourceChainConfig = getChainConfig(sourceChainId)
  const targetChainConfig = getChainConfig(targetChainId)

  if (!sourceChainConfig || !targetChainConfig) return

  return { sourceChainConfig, targetChainConfig }
}

function getChainConfig(chainId: number): AcrossChainConfig | undefined {
  return Object.values(acrossTokenMapping).find((config) => config.chainId === chainId)
}
