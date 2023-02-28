import type { BigUint } from './BigUint';
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
     * Note that under certain conditions it is possible for a settlement to have been mined as
     * part of `block` but not have yet been processed.
     *
     */
    latestSettlementBlock?: number;
    /**
     * The solvable orders included in the auction.
     *
     */
    orders?: Array<Order>;
    /**
     * The reference prices for all traded tokens in the auction as a mapping from token
     * addresses to a price denominated in native token (i.e. 1e18 represents a token that
     * trades one to one with the native token). These prices are used for solution competition
     * for computing surplus and converting fees to native token.
     *
     */
    prices?: Record<string, BigUint>;
};
