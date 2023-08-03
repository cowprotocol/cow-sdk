/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TokenAmount } from './TokenAmount';

/**
 * The buy or sell side when quoting an order.
 */
export type OrderQuoteSide = ({
    kind: 'sell';
    /**
     * The total amount that is available for the order. From this value, the fee
     * is deducted and the buy amount is calculated.
     *
     */
    sellAmountBeforeFee: TokenAmount;
} | {
    kind: 'sell';
    /**
     * The `sellAmount` for the order.
     */
    sellAmountAfterFee: TokenAmount;
} | {
    kind: 'buy';
    /**
     * The `buyAmount` for the order.
     */
    buyAmountAfterFee: TokenAmount;
});

