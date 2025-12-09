import { TokenInfo } from '@cowprotocol/sdk-config'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'

export function determineIntermediateToken(intermediateTokens: TokenInfo[]): TokenInfo {
  // We just pick the first intermediate token for now
  const intermediateToken = intermediateTokens[0]

  if (!intermediateToken) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS, { intermediateTokens })
  }

  return intermediateToken
}
