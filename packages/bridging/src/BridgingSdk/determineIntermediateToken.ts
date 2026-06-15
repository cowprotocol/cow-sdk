import { isSupportedChain, SupportedChainId, TargetChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { Address, areAddressesEqual, getAddressKey, isNativeToken } from '@cowprotocol/sdk-common'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'
import { isStablecoinPriorityToken, isCorrelatedToken, getStablecoinPriorityToken } from './tokenPriority'

export interface IntermediateTokenContext {
  sourceChainId: SupportedChainId
  sourceTokenAddress: Address
  destinationChainId: TargetChainId
  destinationTokenAddress: Address
  intermediateTokens: TokenInfo[]
  getCorrelatedTokens?: (chainId: SupportedChainId) => Promise<string[]>
  allowIntermediateEqSellToken?: boolean
}
/**
 * Priority levels for intermediate token selection
 */
enum TokenPriority {
  STABLECOIN_MATCHES_DESTINATION = 6, // The same stablecoin as destination token
  MATCHES_SELL = 5, // Same as sell token
  STABLECOIN = 4, // USDC/USDT from hardcoded registry (when not covered by STABLECOIN_MATCHES_DESTINATION)
  CORRELATED = 3, // Tokens in CMS correlated tokens list
  NATIVE = 2, // Blockchain native token
  OTHER = 1, // Other tokens
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
export async function determineIntermediateToken(context: IntermediateTokenContext): Promise<TokenInfo> {
  const {
    sourceChainId,
    sourceTokenAddress,
    destinationChainId,
    destinationTokenAddress,
    intermediateTokens,
    getCorrelatedTokens,
    allowIntermediateEqSellToken,
  } = context

  const firstToken = intermediateTokens[0]

  if (intermediateTokens.length === 0 || !firstToken) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS, { intermediateTokens })
  }

  // If only one token, return it immediately
  if (intermediateTokens.length === 1) {
    return firstToken
  }

  const correlatedTokens = await resolveCorrelatedTokens(sourceChainId, getCorrelatedTokens)

  const filteredTokens = allowIntermediateEqSellToken
    ? intermediateTokens
    : intermediateTokens.filter((token) => !areAddressesEqual(token.address, sourceTokenAddress))

  const destinationStableCoin = isSupportedChain(destinationChainId)
    ? getStablecoinPriorityToken(destinationChainId, destinationTokenAddress)
    : undefined

  // Calculate priority for each token
  const tokensWithPriority = filteredTokens.map((token) => {
    const isStableCoin = isStablecoinPriorityToken(token.chainId, token.address)

    if (destinationStableCoin && isStableCoin) {
      const matchesDestinationTokenSymbol =
        !!token.symbol && token.symbol.toLowerCase() === destinationStableCoin?.symbol?.toLowerCase()

      if (matchesDestinationTokenSymbol) {
        return { token, priority: TokenPriority.STABLECOIN_MATCHES_DESTINATION }
      }
    }

    if (areAddressesEqual(token.address, sourceTokenAddress)) {
      return { token, priority: TokenPriority.MATCHES_SELL }
    }
    if (isStableCoin) {
      return { token, priority: TokenPriority.STABLECOIN }
    }
    if (isCorrelatedToken(token.address, correlatedTokens)) {
      return { token, priority: TokenPriority.CORRELATED }
    }
    if (isNativeToken(token)) {
      return { token, priority: TokenPriority.NATIVE }
    }

    return { token, priority: TokenPriority.OTHER }
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
      return new Set<string>(tokens.map((t) => getAddressKey(t)))
    } catch (error) {
      console.warn(
        '[determineIntermediateToken] Failed to fetch correlated tokens, falling back to basic priority',
        error,
      )
    }
  }

  return new Set<string>()
}
