/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BigUint } from './BigUint';
import type { UID } from './UID';

export type SolverSettlement = {
    /**
     * name of the solver
     */
    solver?: string;
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
     * The prices of tokens for settled user orders as passed to the settlement contract.
     *
     */
    prices?: Record<string, BigUint>;
    /**
     * the touched orders
     */
    orders?: Array<{
        id?: UID;
        executedAmount?: BigUint;
    }>;
    /**
     * hex encoded transaction calldata
     */
    callData?: string;
};

