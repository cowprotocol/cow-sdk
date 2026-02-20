import { isSupportedChain, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { Address, areAddressesEqual, isNativeToken, isWrappedNativeToken } from '@cowprotocol/sdk-common'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'
import { isStablecoinPriorityToken, isCorrelatedToken } from './tokenPriority'

/**
 * Priority levels for intermediate token selection
 */
enum TokenPriority {
  HIGHEST = 5, // Same as sell token
  HIGH = 4, // USDC/USDT from hardcoded registry
  MEDIUM = 3, // Tokens in CMS correlated tokens list
  LOW = 2, // Blockchain native token
  LOWEST = 1, // Other tokens
}

/**
 * Determines the best intermediate token from a list of candidates using a priority-based algorithm.
 *
 * @param sourceChainId - The chain ID where the swap originates
 * @param sourceTokenAddress - An address of selling token
 * @param intermediateTokens - Array of candidate intermediate tokens to evaluate
 * @param getCorrelatedTokens - Optional callback to fetch tokens with known high liquidity/correlation.
 *                               Called with `sourceChainId` and should return a list of correlated tokens.
 *                               If not provided or fails, correlated token priority is skipped.
 *
 * @returns The best intermediate token based on the priority algorithm
 *
 * @throws {BridgeProviderQuoteError} If `intermediateTokens` is empty or undefined
 */
export async function determineIntermediateToken(
  sourceChainId: SupportedChainId,
  sourceTokenAddress: Address,
  intermediateTokens: TokenInfo[],
  getCorrelatedTokens?: (chainId: SupportedChainId) => Promise<string[]>,
  allowIntermediateEqSellToken?: boolean,
): Promise<TokenInfo> {
  const firstToken = intermediateTokens[0]

  if (intermediateTokens.length === 0 || !firstToken) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS, { intermediateTokens })
  }

  // If only one token, return it immediately
  if (intermediateTokens.length === 1) {
    return firstToken
  }

  const correlatedTokens = await resolveCorrelatedTokens(sourceChainId, getCorrelatedTokens)

  const sellTokenLike = { chainId: sourceChainId, address: sourceTokenAddress }
  const isSellNativeOrWrapped = isNativeToken(sellTokenLike) || isWrappedNativeToken(sellTokenLike)

  const filteredTokens = allowIntermediateEqSellToken
    ? intermediateTokens
    : intermediateTokens.filter((token) => !areAddressesEqual(token.address, sourceTokenAddress))

  // Calculate priority for each token
  const tokensWithPriority = filteredTokens.map((token) => {
    const isNativeOrWrapped = isNativeToken(token) || isWrappedNativeToken(token)

    if (areAddressesEqual(token.address, sourceTokenAddress)) {
      // Native/wrapped -> native/wrapped is not supported yet (backend restriction)
      if (!(isSellNativeOrWrapped && isNativeOrWrapped)) {
        return { token, priority: TokenPriority.HIGHEST }
      }
    }
    if (isSupportedChain(token.chainId) && isStablecoinPriorityToken(token.chainId, token.address)) {
      return { token, priority: TokenPriority.HIGH }
    }
    if (isCorrelatedToken(token.address, correlatedTokens)) {
      return { token, priority: TokenPriority.MEDIUM }
    }
    // Native/wrapped -> native/wrapped is not supported yet (backend restriction)
    if (isNativeToken(token) && !isSellNativeOrWrapped) {
      return { token, priority: TokenPriority.LOW }
    }

    return { token, priority: TokenPriority.LOWEST }
  })

  // Sort by priority (highest first), then by original order for stability
  tokensWithPriority.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority // Higher priority first
    }
    // Maintain original order for tokens with same priority
    return filteredTokens.indexOf(a.token) - filteredTokens.indexOf(b.token)
  })

  const result = tokensWithPriority[0]?.token

  if (!result) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS, { intermediateTokens: filteredTokens })
  }

  return result
}

async function resolveCorrelatedTokens(
  sourceChainId: SupportedChainId,
  getCorrelatedTokens: ((chainId: SupportedChainId) => Promise<string[]>) | undefined,
): Promise<Set<string>> {
  if (getCorrelatedTokens) {
    try {
      const tokens = await getCorrelatedTokens(sourceChainId)
      return new Set<string>(tokens.map((t) => t.toLowerCase()))
    } catch (error) {
      console.warn(
        '[determineIntermediateToken] Failed to fetch correlated tokens, falling back to basic priority',
        error,
      )
    }
  }

  return new Set<string>()
}
