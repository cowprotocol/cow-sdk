/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';

export type OnchainOrderData = {
    /**
     * If orders are placed as on-chain orders, the owner of the order might be a smart contract, but not the user placing the order. The actual user will be provided in this field.
     *
     */
    sender: Address;
    /**
     * Describes the error, if the order placement was not successful. This could happen, for example, if the `validTo` is too high, or no valid quote was found or generated.
     *
     */
    placementError?: OnchainOrderData.placementError;
};

export namespace OnchainOrderData {

    /**
     * Describes the error, if the order placement was not successful. This could happen, for example, if the `validTo` is too high, or no valid quote was found or generated.
     *
     */
    export enum placementError {
        QUOTE_NOT_FOUND = 'QuoteNotFound',
        VALID_TO_TOO_FAR_IN_FUTURE = 'ValidToTooFarInFuture',
        PRE_VALIDATION_ERROR = 'PreValidationError',
    }


}

