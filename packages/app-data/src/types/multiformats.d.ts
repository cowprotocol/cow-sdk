/**
 * Type definitions for multiformats library
 *
 * This file provides TypeScript type definitions for the multiformats library,
 * which is a JavaScript library without native TypeScript support.
 *
 * The multiformats library is used for handling IPFS CIDs (Content Identifiers)
 * and various encoding formats like base16, base58btc, etc.
 *
 * These definitions ensure type safety when working with:
 * - CID creation and parsing
 * - Multibase encoding/decoding
 * - IPFS hash operations
 *
 * @see https://github.com/multiformats/multiformats
 * @see https://github.com/multiformats/multibase
 */

declare module 'multiformats/bases/base16' {
  /**
   * Base16 encoding/decoding utilities
   * Used for encoding IPFS CIDs in hexadecimal format
   */
  export const base16: {
    /**
     * Encodes bytes to base16 string
     * @param bytes - The bytes to encode
     * @returns Base16 encoded string
     */
    encode: (bytes: Uint8Array) => string
    /**
     * Decodes base16 string to bytes
     * @param str - The base16 string to decode
     * @returns Decoded bytes
     */
    decode: (str: string) => Uint8Array
  }
}

declare module 'multiformats/cid' {
  /**
   * Content Identifier (CID) interface
   * Represents a self-describing content-addressed identifier
   *
   * @see https://github.com/multiformats/cid
   */
  export interface CID {
    /**
     * Convert CID to string representation
     * @param base - Optional base encoder (defaults to base58btc)
     * @returns String representation of the CID
     */
    toString(): string
    /**
     * Convert to CID v1 format
     * @returns CID v1 instance
     */
    toV1(): CID
    /**
     * Convert to CID v0 format
     * @returns CID v0 instance
     */
    toV0(): CID
    /** Raw bytes of the CID */
    bytes: Uint8Array
    /** CID version (0 or 1) */
    version: number
    /** Multicodec code indicating content type */
    code: number
    /** Multihash containing the hash algorithm and digest */
    multihash: {
      /** The actual hash digest */
      digest: Uint8Array
    }
    /** Name of the multibase encoding used */
    multibaseName: string
  }

  /**
   * CID static methods for creating and parsing CIDs
   */
  export const CID: {
    /**
     * Create a new CID instance
     * @param version - CID version (0 or 1)
     * @param code - Multicodec code
     * @param multihash - Multihash bytes
     * @returns New CID instance
     */
    create(version: number, code: number, multihash: Uint8Array): CID
    /**
     * Parse a CID from string or bytes
     * @param cid - CID as string or bytes
     * @param decoder - Optional multibase decoder
     * @returns Parsed CID instance
     */
    parse(cid: string | Uint8Array, decoder?: MultibaseDecoder): CID
    /**
     * Decode CID from raw bytes
     * @param bytes - Raw CID bytes
     * @returns Decoded CID instance
     */
    decode(bytes: Uint8Array): CID
  }

  /**
   * Multibase decoder interface
   * Used for decoding multibase-encoded strings
   *
   * Multibase is a protocol for self-describing base-encoded strings.
   * It adds a prefix character to indicate the encoding used.
   *
   * @see https://github.com/multiformats/multibase
   */
  export type MultibaseDecoder = {
    /**
     * Decode a multibase string to bytes
     * @param multibase - Multibase encoded string (includes prefix)
     * @returns Decoded bytes
     */
    decode(multibase: string): Uint8Array
  }
}
