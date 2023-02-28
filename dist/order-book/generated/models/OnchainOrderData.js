"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnchainOrderData = void 0;
var OnchainOrderData;
(function (OnchainOrderData) {
    /**
     * Describes the error, if the order placement was not
     * successful. This could happen, for example, if the
     * valid_to is too high, or no valid quote was found or generated
     *
     */
    let placementError;
    (function (placementError) {
        placementError["QUOTE_NOT_FOUND"] = "QuoteNotFound";
        placementError["VALID_TO_TOO_FAR_IN_FUTURE"] = "ValidToTooFarInFuture";
        placementError["PRE_VALIDATION_ERROR"] = "PreValidationError";
    })(placementError = OnchainOrderData.placementError || (OnchainOrderData.placementError = {}));
})(OnchainOrderData = exports.OnchainOrderData || (exports.OnchainOrderData = {}));
//# sourceMappingURL=OnchainOrderData.js.map