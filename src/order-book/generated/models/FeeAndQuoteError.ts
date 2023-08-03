/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FeeAndQuoteError = {
    errorType: 'NoLiquidity' | 'UnsupportedToken' | 'AmountIsZero' | 'SellAmountDoesNotCoverFee';
    description: string;
};

