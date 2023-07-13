/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TransactionHash } from './TransactionHash';

/**
 * Provides the additional data for ethflow orders.
 */
export type EthflowData = {
    /**
     * Specifies in which transaction the order was refunded. If
     * this field is null the order was not yet refunded.
     *
     */
    refundTxHash: TransactionHash | null;
    /**
     * Describes the `validTo` of an order ethflow order.
     *
     * **NOTE**: For ethflow orders, the `validTo` encoded in the smart
     * contract is `type(uint256).max`.
     *
     */
    userValidTo: number;
};

