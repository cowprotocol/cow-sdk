import stringify from 'json-stable-stringify'
import type { Quote, QuoteRequest, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'
import { getGlobalAdapter } from '@cowprotocol/sdk-common'
import { ETH_ADDRESS, TokenInfo } from '@cowprotocol/sdk-config'
import type { Hex } from 'viem'

import { NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS } from './const'

import type { NearBlockchainKey } from './const'

export const calculateDeadline = (seconds: number) => {
  const secs = Number(seconds)
  if (!Number.isFinite(secs)) {
    throw new Error(`Invalid seconds value: ${seconds}`)
  }
  const d = new Date(Date.now() + secs * 1000)
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export const adaptToken = (token: TokenResponse): TokenInfo | null => {
  const chainId = NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS[token.blockchain as NearBlockchainKey]
  if (!chainId) return null
  const tokenAddress = token.contractAddress || ETH_ADDRESS
  if (!tokenAddress) return null

  return {
    chainId,
    decimals: token.decimals,
    address: tokenAddress,
    name: token.symbol, // TODO: how to handle? v0/tokens doesn't return the token name
    symbol: token.symbol,
  }
}

export const adaptTokens = (tokens: TokenResponse[]): TokenInfo[] =>
  tokens.reduce<TokenInfo[]>((acc, token) => {
    const adaptedToken = adaptToken(token)
    if (!adaptedToken) return acc
    acc.push(adaptedToken)
    return acc
  }, [])

export const getTokenByAddressAndChainId = (
  tokens: TokenResponse[],
  targetTokenAddress: string,
  targetTokenChainId: number,
): TokenResponse | undefined => {
  return tokens.find((token) => {
    const chainId = NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS[token.blockchain as NearBlockchainKey]
    if (!chainId) return false
    if (targetTokenAddress.toLowerCase() === ETH_ADDRESS.toLowerCase()) return chainId === targetTokenChainId
    const tokenAddress = token.contractAddress || ETH_ADDRESS
    return tokenAddress?.toLowerCase() === targetTokenAddress.toLowerCase() && chainId === targetTokenChainId
  })
}

export const hashQuote = ({
  quote,
  quoteRequest,
  timestamp,
}: {
  quote: Quote
  quoteRequest: QuoteRequest
  timestamp: any
}): Hex => {
  const adapter = getGlobalAdapter()
  const data = stringify({ ...quoteRequest, ...quote, timestamp })
  if (!data) {
    throw new Error('Failed to serialize quote data: quote or quoteRequest may be undefined or invalid')
  }
  return adapter.utils.sha256(adapter.utils.toUtf8Bytes(data))
}
