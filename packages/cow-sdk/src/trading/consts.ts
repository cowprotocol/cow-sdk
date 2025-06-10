import { EcdsaSigningScheme, SigningScheme } from '../order-book'
import { SupportedChainId } from '../chains'

export const DEFAULT_QUOTE_VALIDITY = 60 * 30 // 30 min

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.5%

export const ETH_FLOW_DEFAULT_SLIPPAGE_BPS: Record<SupportedChainId, number> = {
  [SupportedChainId.MAINNET]: 200, // 2%,
  [SupportedChainId.ARBITRUM_ONE]: 50, // 0.5%,
  [SupportedChainId.BASE]: 50, // 0.5%,
  [SupportedChainId.GNOSIS_CHAIN]: 50, // 0.5%,
  [SupportedChainId.SEPOLIA]: 50, // 0.5%,
  [SupportedChainId.POLYGON]: 50, // 0.5%,
  [SupportedChainId.AVALANCHE]: 50, // 0.5%,
}

export const SIGN_SCHEME_MAP = {
  [EcdsaSigningScheme.EIP712]: SigningScheme.EIP712,
  [EcdsaSigningScheme.ETHSIGN]: SigningScheme.ETHSIGN,
}

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
export const GAS_LIMIT_DEFAULT = BigInt(150000)
