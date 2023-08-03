/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type OrderPostError = {
    errorType: 'DuplicateOrder' | 'InsufficientFee' | 'InsufficientAllowance' | 'InsufficientBalance' | 'InsufficientValidTo' | 'ExcessiveValidTo' | 'InvalidSignature' | 'TransferEthToContract' | 'TransferSimulationFailed' | 'UnsupportedToken' | 'WrongOwner' | 'InvalidEip1271Signature' | 'MissingFrom' | 'SameBuyAndSellToken' | 'ZeroAmount' | 'UnsupportedBuyTokenDestination' | 'UnsupportedSellTokenSource' | 'UnsupportedOrderType' | 'UnsupportedSignature' | 'TooManyLimitOrders' | 'InvalidAppData' | 'AppDataHashMismatch';
    description: string;
};

