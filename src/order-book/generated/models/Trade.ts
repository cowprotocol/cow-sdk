/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { BigUint } from './BigUint';
import type { ExecutedProtocolFee } from './ExecutedProtocolFee';
import type { TokenAmount } from './TokenAmount';
import type { TransactionHash } from './TransactionHash';
import type { UID } from './UID';

/**
 * Trade data such as executed amounts, fees, `orderUid` and `block` number.
 *
 */
export type Trade = {
    /**
     * Block in which trade occurred.
     */
    blockNumber: number;
    /**
     * Index in which transaction was included in block.
     */
    logIndex: number;
    /**
     * UID of the order matched by this trade.
     */
    orderUid: UID;
    /**
     * Address of trader.
     */
    owner: Address;
    /**
     * Address of token sold.
     */
    sellToken: Address;
    /**
     * Address of token bought.
     */
    buyToken: Address;
    /**
     * Total amount of `sellToken` that has been executed for this trade (including fees).
     */
    sellAmount: TokenAmount;
    /**
     * The total amount of `sellToken` that has been executed for this order without fees.
     */
    sellAmountBeforeFees: BigUint;
    /**
     * Total amount of `buyToken` received in this trade.
     */
    buyAmount: TokenAmount;
    /**
     * Transaction hash of the corresponding settlement transaction containing the trade (if available).
     */
    txHash: TransactionHash | null;
    /**
     * Executed protocol fees for this trade, together with the fee policies used. Listed in the order they got applied.
     *
     */
    executedProtocolFees?: Array<ExecutedProtocolFee>;
};

