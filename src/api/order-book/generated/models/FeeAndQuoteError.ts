/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FeeAndQuoteError = {
    errorType: FeeAndQuoteError.errorType;
    description: string;
};

export namespace FeeAndQuoteError {

    export enum errorType {
        NO_LIQUIDITY = 'NoLiquidity',
        UNSUPPORTED_TOKEN = 'UnsupportedToken',
        AMOUNT_IS_ZERO = 'AmountIsZero',
        SELL_AMOUNT_DOES_NOT_COVER_FEE = 'SellAmountDoesNotCoverFee',
    }


}

