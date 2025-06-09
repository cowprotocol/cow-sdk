import { Bytes } from '.'

/**
 * Abstract class defining the interface for adapter utilities
 * Based on the EthersV6Utils implementation
 */
export abstract class AdapterUtils {
  /**
   * Converts a string to UTF-8 bytes
   */
  abstract toUtf8Bytes(text: string): Uint8Array

  /**
   * Computes the keccak256 hash of data
   */
  abstract keccak256(data: Bytes): string

  /**
   * Converts a hex string to a Uint8Array
   */
  abstract arrayify(hexString: string): Uint8Array
}
