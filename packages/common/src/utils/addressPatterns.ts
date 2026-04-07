/**
 * Regular expression pattern for validating EVM addresses.
 * Matches addresses that start with 0x followed by exactly 40 hexadecimal characters.
 */
export const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

/**
 * Pattern for validating Bitcoin addresses (legacy P2PKH/P2SH and Bech32 mainnet P2WPKH/P2WSH).
 *
 * Legacy (P2PKH/P2SH): starts with 1 or 3, followed by 24-33 base58 encoded characters.
 *
 * Bech32 (P2WPKH/P2WSH): per BIP-173, addresses must be either entirely uppercase or entirely
 * lowercase (never mixed case). Starts with bc1 (lowercase) or BC1 (uppercase), followed by
 * 39-59 alphanumeric characters.
 */
export const BTC_ADDRESS_PATTERN =
  /^([13][a-km-zA-HJ-NP-Z1-9]{24,33}|bc1[a-z0-9]{39,59}|BC1[A-Z0-9]{39,59})$/

/**
 * Pattern for validating Solana addresses.
 * Solana addresses are Base58-encoded Ed25519 public keys (32 bytes), typically 32-44 characters.
 * Base58 alphabet excludes: 0 (zero), O (capital o), I (capital i), l (lowercase L).
 */
export const SOL_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
