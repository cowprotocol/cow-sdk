import { ETH_ADDRESS, SupportedChainId, TokenInfo, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'
import { TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

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
  const tokenAddress = token.contractAddress || WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address
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
    if (targetTokenAddress === ETH_ADDRESS) return chainId === targetTokenChainId
    const tokenAddress = token.contractAddress || WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address
    return tokenAddress?.toLowerCase() === targetTokenAddress.toLowerCase() && chainId === targetTokenChainId
  })
}

export const isWrappedNativeCurrency = (chainId: number, tokenAddress: string): boolean => {
  return WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId]?.address?.toLowerCase() === tokenAddress.toLowerCase()
}
