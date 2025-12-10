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
