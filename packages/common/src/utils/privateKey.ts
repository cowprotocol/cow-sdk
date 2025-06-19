import { CowError } from './cow-error'

/**
 * Normalizes a private key to the format expected by Viem (`0x${string}`)
 *
 * @param privateKey - Private key with or without 0x prefix
 * @returns Private key with 0x prefix
 * @throws CowError if private key format is invalid
 *
 * @example
 * ```typescript
 * normalizePrivateKey('1234567890abcdef...') // '0x1234567890abcdef...'
 * normalizePrivateKey('0x1234567890abcdef...') // '0x1234567890abcdef...'
 * ```
 */
export function normalizePrivateKey(privateKey: string): `0x${string}` {
  if (!privateKey || typeof privateKey !== 'string') {
    throw new CowError('Private key must be a non-empty string')
  }

  // Remove 0x prefix if it exists
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey

  // Validate hex format and length (64 characters for 32 bytes)
  if (!/^[a-fA-F0-9]{64}$/.test(cleanKey)) {
    throw new CowError(
      'Invalid private key format: must be exactly 64 hexadecimal characters (with or without 0x prefix)',
    )
  }

  return `0x${cleanKey}` as `0x${string}`
}

/**
 * Checks if a string is a valid private key format
 *
 * @param privateKey - String to validate
 * @returns true if valid private key format
 *
 * @example
 * ```typescript
 * isValidPrivateKey('1234567890abcdef...') // true
 * isValidPrivateKey('0x1234567890abcdef...') // true
 * isValidPrivateKey('invalid') // false
 * ```
 */
export function isValidPrivateKey(privateKey: string): boolean {
  try {
    normalizePrivateKey(privateKey)
    return true
  } catch {
    return false
  }
}
