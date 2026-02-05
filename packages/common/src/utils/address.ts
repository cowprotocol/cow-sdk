/**
 * Address key type for normalized addresses.
 * Currently represents EVM addresses (0x prefix + 40 hex chars).
 * For Solana might have different result.
 */
export type AddressKey = `0x${string}`

/**
 * Gets an address key for a given address.
 * Normalizes the address to lowercase with 0x prefix. (could be different for Solana/BTC)
 *
 * @param address - The address string
 * @returns The normalized address key
 */
export function getAddressKey(address: string): AddressKey {
  return `${address.toLowerCase()}` as AddressKey
}
