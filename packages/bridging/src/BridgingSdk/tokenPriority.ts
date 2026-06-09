import { SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { getAddressKey } from '@cowprotocol/sdk-common'

/**
 * High-priority stablecoins registry (USDC and USDT)
 * These tokens get the highest priority when selecting intermediate tokens
 * Addresses should be defined in lowercase for evm chains
 */
export const PRIORITY_STABLECOIN_TOKENS: Partial<Record<SupportedChainId, Set<TokenInfo>>> = {
  [SupportedChainId.MAINNET]: new Set([
    { chainId: SupportedChainId.MAINNET, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6, symbol: 'USDC' },
    { chainId: SupportedChainId.MAINNET, address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6, symbol: 'USDT' },
  ]),
  [SupportedChainId.BNB]: new Set([
    { chainId: SupportedChainId.BNB, address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18, symbol: 'USDC' },
    { chainId: SupportedChainId.BNB, address: '0x55d398326f99059ff775485246999027b3197955', decimals: 18, symbol: 'USDT' },
  ]),
  [SupportedChainId.GNOSIS_CHAIN]: new Set([
    { chainId: SupportedChainId.GNOSIS_CHAIN, address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', decimals: 6, symbol: 'USDC' },
    { chainId: SupportedChainId.GNOSIS_CHAIN, address: '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0', decimals: 6, symbol: 'USDC.e' },
    { chainId: SupportedChainId.GNOSIS_CHAIN, address: '0x4ecaba5870353805a9f068101a40e0f32ed605c6', decimals: 6, symbol: 'USDT' },
  ]),
  [SupportedChainId.POLYGON]: new Set([
    { chainId: SupportedChainId.POLYGON, address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', decimals: 6, symbol: 'USDC' },
    { chainId: SupportedChainId.POLYGON, address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', decimals: 6, symbol: 'USDT' },
  ]),
  [SupportedChainId.BASE]: new Set([
    { chainId: SupportedChainId.BASE, address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', decimals: 6, symbol: 'USDC' },
    { chainId: SupportedChainId.BASE, address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', decimals: 6, symbol: 'USDT' },
  ]),
  [SupportedChainId.ARBITRUM_ONE]: new Set([
    { chainId: SupportedChainId.ARBITRUM_ONE, address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', decimals: 6, symbol: 'USDC' },
    { chainId: SupportedChainId.ARBITRUM_ONE, address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', decimals: 6, symbol: 'USDT' },
  ]),
  [SupportedChainId.AVALANCHE]: new Set([
    { chainId: SupportedChainId.AVALANCHE, address: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', decimals: 6, symbol: 'USDC' },
    { chainId: SupportedChainId.AVALANCHE, address: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', decimals: 6, symbol: 'USDT' },
  ]),
  [SupportedChainId.LINEA]: new Set([
    { chainId: SupportedChainId.LINEA, address: '0x176211869ca2b568f2a7d4ee941e073a821ee1ff', decimals: 6, symbol: 'USDC' },
    { chainId: SupportedChainId.LINEA, address: '0xa219439258ca9da29e9cc4ce5596924745e12b93', decimals: 6, symbol: 'USDT' },
  ]),
  [SupportedChainId.SEPOLIA]: new Set([
    { chainId: SupportedChainId.SEPOLIA, address: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238', decimals: 6, symbol: 'USDC' },
  ]),
}

/**
 * Finds the priority stablecoin entry (USDC/USDT) matching the given token, if any
 */
export function getStablecoinPriorityToken(chainId: SupportedChainId, tokenAddress: string): TokenInfo | undefined {
  const chainTokens = PRIORITY_STABLECOIN_TOKENS[chainId]
  if (!chainTokens) return undefined

  const key = getAddressKey(tokenAddress)
  for (const token of chainTokens) {
    if (getAddressKey(token.address) === key) return token
  }

  return undefined
}

/**
 * Checks if a token is in the high-priority registry (USDC/USDT)
 */
export function isStablecoinPriorityToken(chainId: SupportedChainId, tokenAddress: string): boolean {
  return getStablecoinPriorityToken(chainId, tokenAddress) !== undefined
}

/**
 * Checks if a token is in the CMS correlated tokens list
 */
export function isCorrelatedToken(tokenAddress: string, correlatedTokens: Set<string>): boolean {
  return correlatedTokens.has(getAddressKey(tokenAddress))
}
