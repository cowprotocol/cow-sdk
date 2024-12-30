/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Unique identifier for the order: 56 bytes encoded as hex with `0x`
 * prefix.
 *
 * Bytes 0..32 are the order digest, bytes 30..52 the owner address and
 * bytes 52..56 the expiry (`validTo`) as a `uint32` unix epoch timestamp.
 */
export type UID = string;
