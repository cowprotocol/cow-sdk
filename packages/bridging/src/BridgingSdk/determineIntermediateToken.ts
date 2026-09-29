import { isSupportedChain, SupportedChainId, TargetChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { Address, areAddressesEqual, getAddressKey, isNativeToken, isWrappedNativeToken } from '@cowprotocol/sdk-common'
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
export enum TokenPriority {
  STABLECOIN_MATCHES_DESTINATION = 7, // The same stablecoin as destination token
  MATCHES_SELL = 6, // Same as sell token
  MATCHES_SELL_WRAPPED_OR_NATIVE = 5, // Native <-> wrapped native counterpart of sell token (e.g. WETH when selling ETH)
  STABLECOIN = 4, // USDC/USDT from hardcoded registry (when not covered by STABLECOIN_MATCHES_DESTINATION)
  CORRELATED = 3, // Tokens in CMS correlated tokens list
  NATIVE = 2, // Blockchain native token
  OTHER = 1, // Other tokens
}

export interface RankedIntermediateToken {
  token: TokenInfo
  priority: TokenPriority
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
  const [result] = await rankIntermediateTokens(context)

  if (!result) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS, {
      intermediateTokens: context.intermediateTokens,
    })
  }

  return result.token
}

/**
 * Sorts the candidate intermediate tokens from best to worst using the same priority algorithm as
 * `determineIntermediateToken`. The ranking is used to fall back to the next candidate when the bridge
 * provider has no route for the preferred one.
 *
 * @throws {BridgeProviderQuoteError} If `intermediateTokens` is empty or undefined
 */
export async function rankIntermediateTokens(context: IntermediateTokenContext): Promise<RankedIntermediateToken[]> {
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

  // If only one token, return it immediately. Its priority is irrelevant since there is nothing to rank it against
  if (intermediateTokens.length === 1) {
    return [{ token: firstToken, priority: TokenPriority.OTHER }]
  }

  const correlatedTokens = await resolveCorrelatedTokens(sourceChainId, getCorrelatedTokens)

  const filteredTokens = allowIntermediateEqSellToken
    ? intermediateTokens
    : intermediateTokens.filter((token) => !areAddressesEqual(token.address, sourceTokenAddress))

  const destinationStableCoin = isSupportedChain(destinationChainId)
    ? getStablecoinPriorityToken(destinationChainId, destinationTokenAddress)
    : undefined

  const sellToken = { chainId: sourceChainId, address: sourceTokenAddress }

  // Calculate priority for each token
  const tokensWithPriority = filteredTokens.map((token): RankedIntermediateToken => {
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
    // Wrapping/unwrapping the native token is as cheap as keeping the sell token, so it goes before any real swap
    if (allowIntermediateEqSellToken && isWrappedOrNativeCounterpart(token, sellToken)) {
      return { token, priority: TokenPriority.MATCHES_SELL_WRAPPED_OR_NATIVE }
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

  if (tokensWithPriority.length === 0) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS, { intermediateTokens: filteredTokens })
  }

  return tokensWithPriority
}

/**
 * True when `token` is the native currency and `sellToken` its wrapped version (e.g. ETH / WETH), or vice versa
 */
function isWrappedOrNativeCounterpart(token: TokenInfo, sellToken: { chainId: SupportedChainId; address: string }) {
  if (token.chainId !== sellToken.chainId) return false

  return (
    (isNativeToken(token) && isWrappedNativeToken(sellToken)) ||
    (isWrappedNativeToken(token) && isNativeToken(sellToken))
  )
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
