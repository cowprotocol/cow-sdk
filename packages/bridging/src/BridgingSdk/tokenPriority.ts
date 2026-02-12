import { SupportedEvmChainId } from '@cowprotocol/sdk-config'

/**
 * High-priority stablecoins registry (USDC and USDT)
 * These tokens get the highest priority when selecting intermediate tokens
 */
export const PRIORITY_STABLECOIN_TOKENS: Partial<Record<SupportedEvmChainId, Set<string>>> = {
  [SupportedEvmChainId.MAINNET]: new Set([
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  ]),
  [SupportedEvmChainId.BNB]: new Set([
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
    '0x55d398326f99059ff775485246999027b3197955', // USDT
  ]),
  [SupportedEvmChainId.GNOSIS_CHAIN]: new Set([
    '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC
    '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0', // USDC.e
    '0x4ecaba5870353805a9f068101a40e0f32ed605c6', // USDT
  ]),
  [SupportedEvmChainId.POLYGON]: new Set([
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // USDC
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
  ]),
  [SupportedEvmChainId.BASE]: new Set([
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
    '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', // USDT
  ]),
  [SupportedEvmChainId.ARBITRUM_ONE]: new Set([
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
  ]),
  [SupportedEvmChainId.AVALANCHE]: new Set([
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // USDT
  ]),
  [SupportedEvmChainId.LINEA]: new Set([
    '0x176211869ca2b568f2a7d4ee941e073a821ee1ff', // USDC
    '0xA219439258ca9da29E9Cc4cE5596924745e12B93', // USDT
  ]),
  [SupportedEvmChainId.SEPOLIA]: new Set([
    '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238', // USDC
  ]),
}

/**
 * Checks if a token is in the high-priority registry (USDC/USDT)
 */
export function isStablecoinPriorityToken(chainId: SupportedEvmChainId, tokenAddress: string): boolean {
  const chainTokens = PRIORITY_STABLECOIN_TOKENS[chainId]
  if (!chainTokens) return false

  return chainTokens.has(tokenAddress.toLowerCase())
}

/**
 * Checks if a token is in the CMS correlated tokens list
 */
export function isCorrelatedToken(tokenAddress: string, correlatedTokens: Set<string>): boolean {
  return correlatedTokens.has(tokenAddress.toLowerCase())
}
