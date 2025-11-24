import { OneClickService, OpenAPI } from '@defuse-protocol/one-click-sdk-typescript'

import type {
  GetExecutionStatusResponse,
  QuoteRequest,
  QuoteResponse,
  TokenResponse,
} from '@defuse-protocol/one-click-sdk-typescript'

import type { Address, Hex } from 'viem'

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
