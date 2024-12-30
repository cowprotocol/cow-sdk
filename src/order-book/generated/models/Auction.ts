/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { AuctionOrder } from './AuctionOrder';
import type { AuctionPrices } from './AuctionPrices';

/**
 * A batch auction for solving.
 *
 */
export type Auction = {
    /**
     * The unique identifier of the auction. Increment whenever the backend creates a new auction.
     *
     */
    id?: number;
    /**
     * The block number for the auction. Orders and prices are guaranteed to be valid on this block. Proposed settlements should be valid for this block as well.
     *
     */
    block?: number;
    /**
     * The solvable orders included in the auction.
     *
     */
    orders?: Array<AuctionOrder>;
    prices?: AuctionPrices;
    /**
     * List of addresses on whose surplus will count towards the objective value of their solution (unlike other orders that were created by the solver).
     *
     */
    surplusCapturingJitOrderOwners?: Array<Address>;
};

