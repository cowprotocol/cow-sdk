import type { TokenAmount } from './TokenAmount';
/**
 * The buy or sell side when quoting an order.
 */
export type OrderQuoteSide = ({
    kind: OrderQuoteSide.kind;
    /**
     * The total amount that is available for the order. From this value, the fee
     * is deducted and the buy amount is calculated.
     *
     */
    sellAmountBeforeFee: TokenAmount;
} | {
    kind: OrderQuoteSide.kind;
    /**
     * The sell amount for the order.
     */
    sellAmountAfterFee: TokenAmount;
} | {
    kind: OrderQuoteSide.kind;
    /**
     * The buy amount for the order.
     */
    buyAmountAfterFee: TokenAmount;
});
export declare namespace OrderQuoteSide {
    enum kind {
        SELL = "sell"
    }
}
