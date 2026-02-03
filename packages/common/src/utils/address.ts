import { EvmAddressKey, BtcAddressKey } from './token'

/**
 * Regular expression pattern for validating EVM addresses.
 * Matches addresses that start with 0x followed by exactly 40 hexadecimal characters.
 */
const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

/**
 * Regular expression pattern for validating Bitcoin legacy addresses (P2PKH/P2SH).
 * Matches addresses that start with 1 or 3, followed by 25-34 base58 encoded characters.
 */
const BTC_LEGACY_ADDRESS_PATTERN = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/

/**
 * Regular expression pattern for validating Bitcoin Bech32 mainnet addresses (P2WPKH/P2WSH).
 * Matches addresses that start with bc1, followed by 39-59 alphanumeric characters (case-insensitive).
 */
const BTC_BECH32_MAINNET_PATTERN = /^bc1[a-z0-9]{39,59}$/i

/**
 * Regular expression pattern for validating Bitcoin Bech32 testnet addresses (P2WPKH/P2WSH).
 * Matches addresses that start with tb1, followed by 39-59 alphanumeric characters (case-insensitive).
 */
const BTC_BECH32_TESTNET_PATTERN = /^tb1[a-z0-9]{39,59}$/i

/**
 * Validates if a string is a valid EVM address.
 * Checks for 0x prefix and valid hex characters.
 *
 * @param address - The address string to validate
 * @returns Type guard indicating if the address is a valid EVM address
 */
export function isEvmAddress(address: string | null | undefined): address is EvmAddressKey {
  if (typeof address !== 'string') return false
  if (!address.startsWith('0x')) return false
  if (address.length !== 42) return false // 0x + 40 hex chars
  return EVM_ADDRESS_PATTERN.test(address)
}

/**
 * Validates if a string is a valid Bitcoin address.
 *
 * @param address - The address string to validate
 * @returns Type guard indicating if the address is a valid BTC address
 */
export function isBtcAddress(address: string | null | undefined): address is BtcAddressKey {
  if (typeof address !== 'string') return false
  if (address.length < 26 || address.length > 62) return false

  if (BTC_LEGACY_ADDRESS_PATTERN.test(address)) {
    return true
  }

  if (BTC_BECH32_MAINNET_PATTERN.test(address)) {
    return true
  }

  if (BTC_BECH32_TESTNET_PATTERN.test(address)) {
    return true
  }

  return false
}
