import { BTC_ADDRESS_PATTERN, EVM_ADDRESS_PATTERN, SOL_ADDRESS_PATTERN } from './addressPatterns'

export type EvmAddressKey = `0x${string}`
export type BtcAddressKey = string
export type SolAddressKey = string
export type AddressKey = EvmAddressKey | BtcAddressKey | SolAddressKey

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
  if (address.length < 25 || address.length > 62) return false

  return BTC_ADDRESS_PATTERN.test(address)
}

/**
 * Gets an EVM address key for a given address.
 * Normalizes the address to lowercase with 0x prefix.
 */
export function getEvmAddressKey(address: string): EvmAddressKey {
  return `${address.toLowerCase()}` as EvmAddressKey
}

/**
 * Gets a Bitcoin address key for a given address.
 * Returns the address as-is (Bitcoin addresses are case-sensitive).
 */
export function getBtcAddressKey(address: string): BtcAddressKey {
  return address
}

/**
 * Validates if a string is a valid Solana address.
 * Solana addresses are Base58-encoded Ed25519 public keys, 32-44 characters long.
 *
 * @param address - The address string to validate
 * @returns Type guard indicating if the address is a valid Solana address
 */
export function isSolanaAddress(address: string | null | undefined): address is SolAddressKey {
  if (typeof address !== 'string') return false
  if (address.length < 32 || address.length > 44) return false
  return SOL_ADDRESS_PATTERN.test(address)
}

/**
 * Gets a Solana address key for a given address.
 * Returns the address as-is (Solana addresses are case-sensitive).
 */
export function getSolAddressKey(address: string): SolAddressKey {
  return address
}

/**
 * Gets an address key for a given address.
 * Returns the address key based on the address type.
 */
export function getAddressKey(address: string): AddressKey {
  if (isEvmAddress(address)) return getEvmAddressKey(address)
  // sol and btc addresses are already in the correct format
  return address as AddressKey
}

export function isSupportedAddress(address: string | null | undefined): boolean {
  return isEvmAddress(address) || isBtcAddress(address) || isSolanaAddress(address)
}
