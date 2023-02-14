"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeAndQuoteError = void 0;
var FeeAndQuoteError;
(function (FeeAndQuoteError) {
    let errorType;
    (function (errorType) {
        errorType["NO_LIQUIDITY"] = "NoLiquidity";
        errorType["UNSUPPORTED_TOKEN"] = "UnsupportedToken";
        errorType["AMOUNT_IS_ZERO"] = "AmountIsZero";
        errorType["SELL_AMOUNT_DOES_NOT_COVER_FEE"] = "SellAmountDoesNotCoverFee";
    })(errorType = FeeAndQuoteError.errorType || (FeeAndQuoteError.errorType = {}));
})(FeeAndQuoteError = exports.FeeAndQuoteError || (exports.FeeAndQuoteError = {}));
//# sourceMappingURL=FeeAndQuoteError.js.map