/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * How good should the price estimate be?
 *
 * Fast: The price estimate is chosen among the fastest N price estimates.
 * Optimal: The price estimate is chosen among all price estimates.
 * Verified: The price estimate is chosen among all verified/simulated price estimates.
 *
 * **NOTE**: Orders are supposed to be created from `verified` price estimates.
 *
 */
export type PriceQuality = 'fast' | 'optimal' | 'verified';
