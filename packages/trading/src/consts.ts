import { EcdsaSigningScheme, SigningScheme } from '@cowprotocol/sdk-order-book'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/sdk-config'

export const DEFAULT_QUOTE_VALIDITY = 60 * 30 // 30 min

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.5%

export const ETH_FLOW_DEFAULT_SLIPPAGE_BPS: Record<SupportedChainId, number> = {
  ...mapSupportedNetworks(DEFAULT_SLIPPAGE_BPS), // 0.5% by default for most chains
  [SupportedChainId.MAINNET]: 200, // 2% for mainnet
}

export const SIGN_SCHEME_MAP: Record<EcdsaSigningScheme, SigningScheme> = {
  [EcdsaSigningScheme.EIP712]: SigningScheme.EIP712,
  [EcdsaSigningScheme.ETHSIGN]: SigningScheme.ETHSIGN,
}

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
export const GAS_LIMIT_DEFAULT = BigInt(150000)
