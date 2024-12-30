/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BigUint } from './BigUint';
import type { UID } from './UID';

export type SolverSettlement = {
    /**
     * Name of the solver.
     */
    solver?: string;
    /**
     * The address used by the solver to execute the settlement on-chain.
     *
     * This field is missing for old settlements, the zero address has been
     * used instead.
     */
    solverAddress?: string;
    objective?: {
        /**
         * The total objective value used for ranking solutions.
         */
        total?: number;
        surplus?: number;
        fees?: number;
        cost?: number;
        gas?: number;
    };
    /**
     * The score of the current auction as defined in [CIP-20](https://snapshot.org/#/cow.eth/proposal/0x2d3f9bd1ea72dca84b03e97dda3efc1f4a42a772c54bd2037e8b62e7d09a491f).
     * It is `null` for old auctions.
     *
     */
    score?: BigUint | null;
    /**
     * The prices of tokens for settled user orders as passed to the settlement contract.
     *
     */
    clearingPrices?: Record<string, BigUint>;
    /**
     * Touched orders.
     */
    orders?: Array<{
        id?: UID;
        executedAmount?: BigUint;
    }>;
    /**
     * whether the solution is a winner (received the right to get executed) or not
     */
    isWinner?: boolean;
};

