/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ReplaceOrderError = {
    errorType: 'AlreadyCancelled' | 'OrderFullyExecuted' | 'OrderExpired' | 'OnChainOrder' | 'DuplicateOrder' | 'InsufficientFee' | 'InsufficientAllowance' | 'InsufficientBalance' | 'InsufficientValidTo' | 'ExcessiveValidTo' | 'InvalidSignature' | 'TransferEthToContract' | 'TransferSimulationFailed' | 'UnsupportedToken' | 'WrongOwner' | 'SameBuyAndSellToken' | 'ZeroAmount' | 'UnsupportedBuyTokenDestination' | 'UnsupportedSellTokenSource' | 'UnsupportedOrderType' | 'UnsupportedSignature';
    description: string;
};

