/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ReplaceOrderError = {
    errorType: ReplaceOrderError.errorType;
    description: string;
};

export namespace ReplaceOrderError {

    export enum errorType {
        ALREADY_CANCELLED = 'AlreadyCancelled',
        ORDER_FULLY_EXECUTED = 'OrderFullyExecuted',
        ORDER_EXPIRED = 'OrderExpired',
        ON_CHAIN_ORDER = 'OnChainOrder',
        DUPLICATED_ORDER = 'DuplicatedOrder',
        INSUFFICIENT_FEE = 'InsufficientFee',
        INSUFFICIENT_ALLOWANCE = 'InsufficientAllowance',
        INSUFFICIENT_BALANCE = 'InsufficientBalance',
        INSUFFICIENT_VALID_TO = 'InsufficientValidTo',
        EXCESSIVE_VALID_TO = 'ExcessiveValidTo',
        INVALID_SIGNATURE = 'InvalidSignature',
        TRANSFER_ETH_TO_CONTRACT = 'TransferEthToContract',
        TRANSFER_SIMULATION_FAILED = 'TransferSimulationFailed',
        UNSUPPORTED_TOKEN = 'UnsupportedToken',
        WRONG_OWNER = 'WrongOwner',
        SAME_BUY_AND_SELL_TOKEN = 'SameBuyAndSellToken',
        ZERO_AMOUNT = 'ZeroAmount',
        UNSUPPORTED_BUY_TOKEN_DESTINATION = 'UnsupportedBuyTokenDestination',
        UNSUPPORTED_SELL_TOKEN_SOURCE = 'UnsupportedSellTokenSource',
        UNSUPPORTED_ORDER_TYPE = 'UnsupportedOrderType',
        UNSUPPORTED_SIGNATURE = 'UnsupportedSignature',
    }


}

