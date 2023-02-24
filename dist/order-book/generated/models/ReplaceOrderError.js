"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceOrderError = void 0;
var ReplaceOrderError;
(function (ReplaceOrderError) {
    let errorType;
    (function (errorType) {
        errorType["ALREADY_CANCELLED"] = "AlreadyCancelled";
        errorType["ORDER_FULLY_EXECUTED"] = "OrderFullyExecuted";
        errorType["ORDER_EXPIRED"] = "OrderExpired";
        errorType["ON_CHAIN_ORDER"] = "OnChainOrder";
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
        errorType["SAME_BUY_AND_SELL_TOKEN"] = "SameBuyAndSellToken";
        errorType["ZERO_AMOUNT"] = "ZeroAmount";
        errorType["UNSUPPORTED_BUY_TOKEN_DESTINATION"] = "UnsupportedBuyTokenDestination";
        errorType["UNSUPPORTED_SELL_TOKEN_SOURCE"] = "UnsupportedSellTokenSource";
        errorType["UNSUPPORTED_ORDER_TYPE"] = "UnsupportedOrderType";
        errorType["UNSUPPORTED_SIGNATURE"] = "UnsupportedSignature";
    })(errorType = ReplaceOrderError.errorType || (ReplaceOrderError.errorType = {}));
})(ReplaceOrderError = exports.ReplaceOrderError || (exports.ReplaceOrderError = {}));
//# sourceMappingURL=ReplaceOrderError.js.map