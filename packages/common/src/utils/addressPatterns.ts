/**
 * Regular expression pattern for validating EVM addresses.
 * Matches addresses that start with 0x followed by exactly 40 hexadecimal characters.
 */
export const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

/**
 * Patterns for validating Bitcoin addresses.
 *
 * Legacy (P2PKH/P2SH): starts with `1` or `3`, followed by 24-33 base58 characters
 * (case-sensitive). Excludes ambiguous chars `0`, `O`, `I`, `l` per Bitcoin base58 spec.
 */
export const BTC_LEGACY_ADDRESS_PATTERN = /^[13][a-km-zA-HJ-NP-Z1-9]{24,33}$/

/**
 * Bech32 mainnet (P2WPKH/P2WSH) per BIP-173.
 *
 * Prefix `bc1`. Bech32 alphabet (32 chars): `0,2-9,a-z` minus `b,i,o,1`
 * (which `[023456789ac-hj-np-z]` encodes).
 *
 * Note: BIP-173 specifies addresses must be entirely uppercase or entirely lowercase
 * (mixed case is invalid). This pattern is permissive on case (`/i` flag) because
 * upstream tooling commonly normalizes addresses to lowercase before validation, and
 * downstream checksum verification (not done here) is the authoritative check.
 *
 * Testnet (`tb1`) is intentionally not supported — CoW Protocol bridges to BTC mainnet only.
 */
export const BTC_BECH32_ADDRESS_PATTERN = /^bc1[023456789ac-hj-np-z]{39,59}$/i

/**
 * Combined pattern — matches both legacy (case-sensitive) and Bech32 (case-insensitive).
 * Use {@link BTC_LEGACY_ADDRESS_PATTERN} or {@link BTC_BECH32_ADDRESS_PATTERN} directly
 * when you need to distinguish the two formats.
 */
export const BTC_ADDRESS_PATTERN =
  /^(?:[13][a-km-zA-HJ-NP-Z1-9]{24,33}|[bB][cC]1[023456789ac-hj-np-zAC-HJ-NP-Z]{39,59})$/

/**
 * Pattern for validating Solana addresses.
 * Solana addresses are Base58-encoded Ed25519 public keys (32 bytes), typically 32-44 characters.
 * Base58 alphabet excludes: 0 (zero), O (capital o), I (capital i), l (lowercase L).
 */
export const SOL_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
