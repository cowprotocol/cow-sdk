"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderPostError = void 0;
var OrderPostError;
(function (OrderPostError) {
    let errorType;
    (function (errorType) {
        errorType["DUPLICATE_ORDER"] = "DuplicateOrder";
        errorType["INSUFFICIENT_FEE"] = "InsufficientFee";
        errorType["INSUFFICIENT_ALLOWANCE"] = "InsufficientAllowance";
        errorType["INSUFFICIENT_BALANCE"] = "InsufficientBalance";
        errorType["INSUFFICIENT_VALID_TO"] = "InsufficientValidTo";
        errorType["EXCESSIVE_VALID_TO"] = "ExcessiveValidTo";
        errorType["INVALID_SIGNATURE"] = "InvalidSignature";
        errorType["TRANSFER_ETH_TO_CONTRACT"] = "TransferEthToContract";
        errorType["TRANSFER_SIMULATION_FAILED"] = "TransferSimulationFailed";
        errorType["UNSUPPORTED_TOKEN"] = "UnsupportedToken";
        errorType["WRONG_OWNER"] = "WrongOwner";
        errorType["MISSING_FROM"] = "MissingFrom";
        errorType["SAME_BUY_AND_SELL_TOKEN"] = "SameBuyAndSellToken";
        errorType["ZERO_AMOUNT"] = "ZeroAmount";
        errorType["UNSUPPORTED_BUY_TOKEN_DESTINATION"] = "UnsupportedBuyTokenDestination";
        errorType["UNSUPPORTED_SELL_TOKEN_SOURCE"] = "UnsupportedSellTokenSource";
        errorType["UNSUPPORTED_ORDER_TYPE"] = "UnsupportedOrderType";
        errorType["UNSUPPORTED_SIGNATURE"] = "UnsupportedSignature";
        errorType["TOO_MANY_LIMIT_ORDERS"] = "TooManyLimitOrders";
    })(errorType = OrderPostError.errorType || (OrderPostError.errorType = {}));
})(OrderPostError = exports.OrderPostError || (exports.OrderPostError = {}));
//# sourceMappingURL=OrderPostError.js.map