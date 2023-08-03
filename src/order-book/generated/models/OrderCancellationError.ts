/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type OrderCancellationError = {
    errorType: 'InvalidSignature' | 'WrongOwner' | 'OrderNotFound' | 'AlreadyCancelled' | 'OrderFullyExecuted' | 'OrderExpired' | 'OnChainOrder';
    description: string;
};

