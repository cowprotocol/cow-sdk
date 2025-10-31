import { OneClickService } from '@defuse-protocol/one-click-sdk-typescript'

import type {
  GetExecutionStatusResponse,
  QuoteRequest,
  QuoteResponse,
  TokenResponse,
} from '@defuse-protocol/one-click-sdk-typescript'

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
    return await OneClickService.getQuote(request)
  }

  async getStatus(depositAddress: string): Promise<GetExecutionStatusResponse> {
    return await OneClickService.getExecutionStatus(depositAddress)
  }
}
