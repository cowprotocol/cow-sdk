import { ApiError, OneClickService, OpenAPI } from '@defuse-protocol/one-click-sdk-typescript'

import type {
  GetExecutionStatusResponse,
  QuoteRequest,
  QuoteResponse,
  TokenResponse,
} from '@defuse-protocol/one-click-sdk-typescript'

import type { Address, Hex } from 'viem'

import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'

interface GetAttestationRequest {
  depositAddress: Address
  quoteHash: Hex
}

interface GetAttestationResponse {
  signature: Hex
  version: number
}

export class NearIntentsApi {
  private cachedTokens: TokenResponse[] = []

  constructor(apiKey?: string) {
    if (apiKey) {
      OpenAPI.TOKEN = apiKey
    }
  }

  async getTokens(): Promise<TokenResponse[]> {
    if (this.cachedTokens.length === 0) {
      const response = await OneClickService.getTokens()
      this.cachedTokens = response
    }
    return this.cachedTokens
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      return await OneClickService.getQuote(request)
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const message = error.body?.message
        if (message && typeof message === 'string' && message.toLowerCase().includes('amount is too low')) {
          const minAmountMatch = message.match(/try at least (\d+)/)
          const minAmount = minAmountMatch ? minAmountMatch[1] : undefined
          throw new BridgeProviderQuoteError(BridgeQuoteErrors.SELL_AMOUNT_TOO_SMALL, {
            originalMessage: message,
            minAmount,
          })
        }
      }
      throw error
    }
  }

  async getStatus(depositAddress: string): Promise<GetExecutionStatusResponse> {
    return await OneClickService.getExecutionStatus(depositAddress)
  }

  async getAttestation(request: GetAttestationRequest): Promise<GetAttestationResponse> {
    const response = await fetch(`${OpenAPI.BASE}/v0/attestation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return (await response.json()) as GetAttestationResponse
  }
}
