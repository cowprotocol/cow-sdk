import { ETH_ADDRESS, TokenInfo } from '@cowprotocol/sdk-config'
import { TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

import {
  NEAR_INTENTS_BLOCKCHAIN_TO_COW_NETWORK,
  NEAR_INTENTS_BLOCKCHAIN_TO_NATIVE_WRAPPED_TOKEN_ADDRESS,
} from './const'

export const calculateDeadline = (seconds: number) => {
  const secs = Number(seconds)
  if (!Number.isFinite(secs)) {
    throw new Error(`Invalid seconds value: ${seconds}`)
  }
  const d = new Date(Date.now() + secs * 1000)
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export const adaptTokens = (tokens: TokenResponse[]): TokenInfo[] =>
  tokens.reduce<TokenInfo[]>((acc, token) => {
    const network = NEAR_INTENTS_BLOCKCHAIN_TO_COW_NETWORK[token.blockchain]
    if (!network) return acc
    const tokenAddress =
      token.contractAddress || NEAR_INTENTS_BLOCKCHAIN_TO_NATIVE_WRAPPED_TOKEN_ADDRESS[token.blockchain]
    if (!tokenAddress) return acc
    acc.push({
      chainId: network.id,
      decimals: token.decimals,
      address: tokenAddress,
      name: token.symbol, // TODO: how to handle? v0/tokens doesn't return the token name
      symbol: token.symbol,
    })
    return acc
  }, [])

export const getTokenByAddressAndChainId = (
  tokens: TokenResponse[],
  targetTokenAddress: string,
  targetTokenChainId: number,
) => {
  return tokens.find((token) => {
    const network = NEAR_INTENTS_BLOCKCHAIN_TO_COW_NETWORK[token.blockchain]
    if (!network) return false
    const tokenAddress = token.contractAddress?.toLowerCase() || ETH_ADDRESS.toLowerCase()
    return (
      tokenAddress.toLowerCase() === targetTokenAddress.toLowerCase() && network && network.id === targetTokenChainId
    )
  })
}
