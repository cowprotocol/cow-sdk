/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExecutedAmounts } from './ExecutedAmounts';

export type CompetitionOrderStatus = {
    type: CompetitionOrderStatus.type;
    /**
     * A list of solvers who participated in the latest competition. The presence of executed amounts defines whether the solver provided a solution for the desired order.
     *
     */
    value?: Array<{
        /**
         * Name of the solver.
         */
        solver: string;
        executedAmounts?: ExecutedAmounts;
    }>;
};

export namespace CompetitionOrderStatus {

    export enum type {
        OPEN = 'Open',
        SCHEDULED = 'Scheduled',
        ACTIVE = 'Active',
        SOLVED = 'Solved',
        EXECUTING = 'Executing',
        TRADED = 'Traded',
        CANCELLED = 'Cancelled',
    }


}

