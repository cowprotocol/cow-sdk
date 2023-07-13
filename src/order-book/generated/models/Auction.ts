/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AuctionPrices } from './AuctionPrices';
import type { Order } from './Order';

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
     * The block number for the auction. Orders and prices are guaranteed to be valid on this
     * block. Proposed settlements should be valid for this block as well.
     *
     */
    block?: number;
    /**
     * The latest block on which a settlement has been processed.
     *
     * **NOTE**: Under certain conditions it is possible for a settlement to have been mined as
     * part of `block` but not have yet been processed.
     *
     */
    latestSettlementBlock?: number;
    /**
     * The solvable orders included in the auction.
     *
     */
    orders?: Array<Order>;
    prices?: AuctionPrices;
};

