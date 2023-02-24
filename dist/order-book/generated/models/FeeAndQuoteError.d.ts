export type FeeAndQuoteError = {
    errorType: FeeAndQuoteError.errorType;
    description: string;
};
export declare namespace FeeAndQuoteError {
    enum errorType {
        NO_LIQUIDITY = "NoLiquidity",
        UNSUPPORTED_TOKEN = "UnsupportedToken",
        AMOUNT_IS_ZERO = "AmountIsZero",
        SELL_AMOUNT_DOES_NOT_COVER_FEE = "SellAmountDoesNotCoverFee"
    }
}
