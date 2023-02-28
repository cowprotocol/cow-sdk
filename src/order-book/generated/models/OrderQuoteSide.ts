/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderKind } from './OrderKind';
import type { TokenAmount } from './TokenAmount';

/**
 * The buy or sell side when quoting an order.
 */
export type OrderQuoteSide = ({
    kind: OrderKind;
    /**
     * The total amount that is available for the order. From this value, the fee
     * is deducted and the buy amount is calculated.
     *
     */
    sellAmountBeforeFee: TokenAmount;
} | {
    kind: OrderKind;
    /**
     * The sell amount for the order.
     */
    sellAmountAfterFee: TokenAmount;
} | {
    kind: OrderKind;
    /**
     * The buy amount for the order.
     */
    buyAmountAfterFee: TokenAmount;
});

