/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BigUint } from './BigUint';

/**
 * The reference prices for all traded tokens in the auction as a mapping from token addresses to a price denominated in native token (i.e. 1e18 represents a token that trades one to one with the native token). These prices are used for solution competition for computing surplus and converting fees to native token.
 *
 */
export type AuctionPrices = Record<string, BigUint>;
