export class BridgeProviderQuoteError extends Error {
  constructor(message: string, public readonly context: any) {
    super(message)
    this.name = 'BridgeProviderQuoteError'
  }
}
