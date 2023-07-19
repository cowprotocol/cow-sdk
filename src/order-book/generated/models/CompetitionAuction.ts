/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AuctionPrices } from './AuctionPrices';
import type { UID } from './UID';

/**
 * The components that describe a batch auction for the solver competition.
 *
 */
export type CompetitionAuction = {
    /**
     * The UIDs of the orders included in the auction.
     *
     */
    orders?: Array<UID>;
    prices?: AuctionPrices;
};

