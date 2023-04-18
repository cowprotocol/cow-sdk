/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BigUint } from './BigUint';
import type { CallData } from './CallData';
import type { UID } from './UID';

export type SolverSettlement = {
    /**
     * name of the solver
     */
    solver?: string;
    /**
     * The address used by the solver to execute the settlement onchain.
     * This field is missing for old settlements, the zero address has been used instead.
     *
     */
    solverAddress?: string;
    objective?: {
        /**
         * the total objective value used for ranking solutions
         */
        total?: number;
        surplus?: number;
        fees?: number;
        cost?: number;
        gas?: number;
    };
    /**
     * The score of the current auction as defined in CIP-20.
     * It is null for old auctions.
     *
     */
    score?: BigUint | null;
    /**
     * The prices of tokens for settled user orders as passed to the settlement contract.
     *
     */
    clearingPrices?: Record<string, BigUint>;
    /**
     * the touched orders
     */
    orders?: Array<{
        id?: UID;
        executedAmount?: BigUint;
    }>;
    /**
     * Transaction call data that is executed onchain if the settlement is executed.
     */
    callData?: CallData;
    /**
     * Full call data as generated from the original solver output.
     * It can be different from the executed transaction if part of the settlements are internalized (use internal liquidity in lieu of trading against onchain liquidity).
     * This field is omitted in case it coincides with callData.
     *
     */
    uninternalizedCallData?: CallData;
};

