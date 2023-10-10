/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PriceEstimationError = {
    errorType: PriceEstimationError.errorType;
    description: string;
};

export namespace PriceEstimationError {

    export enum errorType {
        UNSUPPORTED_TOKEN = 'UnsupportedToken',
        ZERO_AMOUNT = 'ZeroAmount',
        UNSUPPORTED_ORDER_TYPE = 'UnsupportedOrderType',
    }


}

