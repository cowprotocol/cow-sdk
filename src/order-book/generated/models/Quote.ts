/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TokenAmount } from './TokenAmount';

/**
 * A calculated order quote.
 *
 */
export type Quote = {
    /**
     * The amount of the sell token.
     */
    sellAmount?: TokenAmount;
    /**
     * The amount of the buy token.
     */
    buyAmount?: TokenAmount;
    /**
     * The amount that needs to be paid, denominated in the sell token.
     */
    fee?: TokenAmount;
};

