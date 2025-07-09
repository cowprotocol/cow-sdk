export class BridgeProviderQuoteError extends Error {
  constructor(
    message: string,
    public readonly context: unknown,
  ) {
    super(message)
    this.name = 'BridgeProviderQuoteError'
  }
}
