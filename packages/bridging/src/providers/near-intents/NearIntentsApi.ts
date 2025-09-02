import { OneClickService, QuoteRequest } from '@defuse-protocol/one-click-sdk-typescript'

import type { QuoteResponse, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

export class NearIntentsApi {
  private cachedTokens: TokenResponse[] = []

  async getTokens(): Promise<TokenResponse[]> {
    if (this.cachedTokens.length === 0) {
      const response = await OneClickService.getTokens()
      this.cachedTokens = response
    }
    return this.cachedTokens
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    // Get quote
    const quote = await OneClickService.getQuote(quoteRequest)
  }
}

export default NearIntentsApi
