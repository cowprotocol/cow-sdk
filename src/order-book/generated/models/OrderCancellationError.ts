/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type OrderCancellationError = {
    errorType: OrderCancellationError.errorType;
    description: string;
};

export namespace OrderCancellationError {

    export enum errorType {
        INVALID_SIGNATURE = 'InvalidSignature',
        WRONG_OWNER = 'WrongOwner',
        ORDER_NOT_FOUND = 'OrderNotFound',
        ALREADY_CANCELLED = 'AlreadyCancelled',
        ORDER_FULLY_EXECUTED = 'OrderFullyExecuted',
        ORDER_EXPIRED = 'OrderExpired',
        ON_CHAIN_ORDER = 'OnChainOrder',
    }


}

