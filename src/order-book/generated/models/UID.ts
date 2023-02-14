/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Unique identifier for the order: 56 bytes encoded as hex with `0x` prefix.
 * Bytes 0 to 32 are the order digest, bytes 30 to 52 the owner address
 * and bytes 52..56 valid to,
 *
 */
export type UID = string;
