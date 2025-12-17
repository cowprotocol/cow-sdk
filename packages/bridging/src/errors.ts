export enum BridgeQuoteErrors {
  NO_INTERMEDIATE_TOKENS = 'NO_INTERMEDIATE_TOKENS',
  API_ERROR = 'API_ERROR',
  INVALID_API_JSON_RESPONSE = 'INVALID_API_JSON_RESPONSE',
  ONLY_SELL_ORDER_SUPPORTED = 'ONLY_SELL_ORDER_SUPPORTED',
  TX_BUILD_ERROR = 'TX_BUILD_ERROR',
  QUOTE_ERROR = 'QUOTE_ERROR',
  NO_ROUTES = 'NO_ROUTES',
  INVALID_BRIDGE = 'INVALID_BRIDGE',
  QUOTE_DOES_NOT_MATCH_DEPOSIT_ADDRESS = 'QUOTE_DOES_NOT_MATCH_DEPOSIT_ADDRESS',
  SELL_AMOUNT_TOO_SMALL = 'SELL_AMOUNT_TOO_SMALL',
}

export const BridgeQuoteErrorPriorities: Record<BridgeQuoteErrors, number> = {
  [BridgeQuoteErrors.SELL_AMOUNT_TOO_SMALL]: 10,
  [BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED]: 9,
  [BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS]: 1,
  [BridgeQuoteErrors.API_ERROR]: 1,
  [BridgeQuoteErrors.INVALID_API_JSON_RESPONSE]: 1,
  [BridgeQuoteErrors.TX_BUILD_ERROR]: 1,
  [BridgeQuoteErrors.QUOTE_ERROR]: 1,
  [BridgeQuoteErrors.NO_ROUTES]: 1,
  [BridgeQuoteErrors.INVALID_BRIDGE]: 1,
  [BridgeQuoteErrors.QUOTE_DOES_NOT_MATCH_DEPOSIT_ADDRESS]: 1,
}

export class BridgeProviderQuoteError extends Error {
  constructor(
    message: BridgeQuoteErrors,
    public readonly context?: unknown,
  ) {
    super(message)
    this.name = 'BridgeProviderQuoteError'
  }
}

export class BridgeProviderError extends Error {
  constructor(
    message: string,
    public readonly context: unknown,
  ) {
    super(message)
    this.name = 'BridgeProviderError'
  }
}

export class BridgeOrderParsingError extends Error {
  constructor(
    message: string,
    public readonly context?: unknown,
  ) {
    super(message)
    this.name = 'BridgeOrderParsingError'
  }
}
