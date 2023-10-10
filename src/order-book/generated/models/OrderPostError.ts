/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type OrderPostError = {
    errorType: OrderPostError.errorType;
    description: string;
};

export namespace OrderPostError {

    export enum errorType {
        DUPLICATED_ORDER = 'DuplicatedOrder',
        QUOTE_NOT_FOUND = 'QuoteNotFound',
        INVALID_QUOTE = 'InvalidQuote',
        MISSING_FROM = 'MissingFrom',
        WRONG_OWNER = 'WrongOwner',
        INVALID_EIP1271SIGNATURE = 'InvalidEip1271Signature',
        INSUFFICIENT_BALANCE = 'InsufficientBalance',
        INSUFFICIENT_ALLOWANCE = 'InsufficientAllowance',
        INVALID_SIGNATURE = 'InvalidSignature',
        INSUFFICIENT_FEE = 'InsufficientFee',
        SELL_AMOUNT_OVERFLOW = 'SellAmountOverflow',
        TRANSFER_SIMULATION_FAILED = 'TransferSimulationFailed',
        ZERO_AMOUNT = 'ZeroAmount',
        INCOMPATIBLE_SIGNING_SCHEME = 'IncompatibleSigningScheme',        
        UNSUPPORTED_BUY_TOKEN_DESTINATION = 'UnsupportedBuyTokenDestination',
        UNSUPPORTED_SELL_TOKEN_SOURCE = 'UnsupportedSellTokenSource',
        UNSUPPORTED_ORDER_TYPE = 'UnsupportedOrderType',
        INSUFFICIENT_VALID_TO = 'InsufficientValidTo',
        EXCESSIVE_VALID_TO = 'ExcessiveValidTo',
        TRANSFER_ETH_TO_CONTRACT = 'TransferEthToContract',
        INVALID_NATIVE_SELL_TOKEN = 'InvalidNativeSellToken',
        SAME_BUY_AND_SELL_TOKEN = 'SameBuyAndSellToken',
        UNSUPPORTED_SIGNATURE = 'UnsupportedSignature',
        TOO_MANY_LIMIT_ORDERS= 'TooManyLimitOrders',
        INVALID_APP_DATA = 'InvalidAppData',
        UNSUPPORTED_TOKEN = 'UnsupportedToken',
        UNSUPPORTED_CUSTOM_INTERACTION = 'UnsupportedCustomInteraction',
        APP_DATA_HASH_MISMATCH = 'AppDataHashMismatch',
    }


}

