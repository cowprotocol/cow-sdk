import type { SolverSettlement } from './SolverSettlement';
import type { TransactionHash } from './TransactionHash';
/**
 * The settlements submitted by every solver for a specific auction.
 * The auction id corresponds to the id external solvers are provided
 * with.
 *
 */
export type SolverCompetitionResponse = {
    /**
     * The id of the auction the competition info is for.
     */
    auctionId?: number;
    /**
     * The hash of the transaction that the winning solution of this info was submitted in.
     */
    transactionHash?: TransactionHash | null;
    /**
     * gas price used for ranking solutions
     */
    gasPrice?: number;
    liquidityCollectedBlock?: number;
    competitionSimulationBlock?: number;
    /**
     * Maps from solver name to object describing that solver's settlement.
     */
    solutions?: Array<SolverSettlement>;
};
