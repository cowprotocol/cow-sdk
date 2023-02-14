"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCancellationError = void 0;
var OrderCancellationError;
(function (OrderCancellationError) {
    let errorType;
    (function (errorType) {
        errorType["INVALID_SIGNATURE"] = "InvalidSignature";
        errorType["WRONG_OWNER"] = "WrongOwner";
        errorType["ORDER_NOT_FOUND"] = "OrderNotFound";
        errorType["ALREADY_CANCELLED"] = "AlreadyCancelled";
        errorType["ORDER_FULLY_EXECUTED"] = "OrderFullyExecuted";
        errorType["ORDER_EXPIRED"] = "OrderExpired";
        errorType["ON_CHAIN_ORDER"] = "OnChainOrder";
    })(errorType = OrderCancellationError.errorType || (OrderCancellationError.errorType = {}));
})(OrderCancellationError = exports.OrderCancellationError || (exports.OrderCancellationError = {}));
//# sourceMappingURL=OrderCancellationError.js.map