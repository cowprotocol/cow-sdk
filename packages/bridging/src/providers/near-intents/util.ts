import { ETH_ADDRESS, TokenInfo } from '@cowprotocol/sdk-config'
import { TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

import { NEAR_INTENTS_BLOCKCHAIN_TO_COW_NETWORK, WRAPPED_NATIVE_CURRENCIES } from './const'

export const calculateDeadline = (seconds: number) => {
  const secs = Number(seconds)
  if (!Number.isFinite(secs)) {
    throw new Error(`Invalid seconds value: ${seconds}`)
  }
  const d = new Date(Date.now() + secs * 1000)
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export const adaptToken = (token: TokenResponse): TokenInfo | null => {
  const network = NEAR_INTENTS_BLOCKCHAIN_TO_COW_NETWORK[token.blockchain]
  if (!network) return null
  const tokenAddress = token.contractAddress || WRAPPED_NATIVE_CURRENCIES[token.blockchain]
  if (!tokenAddress) return null

  return {
    chainId: network.id,
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
    const network = NEAR_INTENTS_BLOCKCHAIN_TO_COW_NETWORK[token.blockchain]
    if (!network) return false
    if (targetTokenAddress === ETH_ADDRESS) return network && network.id === targetTokenChainId
    const tokenAddress = token.contractAddress?.toLowerCase() || WRAPPED_NATIVE_CURRENCIES[token.blockchain]
    return (
      tokenAddress?.toLowerCase() === targetTokenAddress.toLowerCase() && network && network.id === targetTokenChainId
    )
  })
}
