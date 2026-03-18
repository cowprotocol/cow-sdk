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
 * Prefix `bc1` (lowercase) or `BC1` (uppercase). Bech32 alphabet (32 chars): `0,2-9,a-z`
 * minus `b,i,o,1` (which `[023456789ac-hj-np-z]` encodes — uppercase is the same set).
 *
 * BIP-173 requires Bech32 to be entirely uppercase OR entirely lowercase — mixed case is
 * INVALID (checksums use case-folded inputs, so mixed case would produce a different
 * checksum and a different — possibly malformed — address). Hence two strict branches
 * rather than a `/i` flag.
 *
 * Testnet (`tb1`) is intentionally not supported — CoW Protocol bridges to BTC mainnet only.
 */
export const BTC_BECH32_ADDRESS_PATTERN =
  /^(?:bc1[023456789ac-hj-np-z]{39,59}|BC1[023456789AC-HJ-NP-Z]{39,59})$/

/**
 * Combined pattern — matches legacy P2PKH/P2SH and Bech32 P2WPKH/P2WSH. Bech32 is strict
 * per BIP-173 (lowercase OR uppercase, never mixed). Use {@link BTC_LEGACY_ADDRESS_PATTERN}
 * or {@link BTC_BECH32_ADDRESS_PATTERN} directly when you need to distinguish the two formats.
 */
export const BTC_ADDRESS_PATTERN =
  /^(?:[13][a-km-zA-HJ-NP-Z1-9]{24,33}|bc1[023456789ac-hj-np-z]{39,59}|BC1[023456789AC-HJ-NP-Z]{39,59})$/

/**
 * Pattern for validating Solana addresses.
 * Solana addresses are Base58-encoded Ed25519 public keys (32 bytes), typically 32-44 characters.
 * Base58 alphabet excludes: 0 (zero), O (capital o), I (capital i), l (lowercase L).
 */
export const SOL_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
