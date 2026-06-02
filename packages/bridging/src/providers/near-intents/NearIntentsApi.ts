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
  private static readonly DEPRECATED_ASSET_IDS: readonly string[] = ['nep141:btc.omft.near']

  private cachedTokens: TokenResponse[] = []

  constructor(apiKey?: string) {
    if (apiKey) {
      OpenAPI.TOKEN = apiKey
    }
  }

  async getTokens(options: { includeDeprecated?: boolean } = {}): Promise<TokenResponse[]> {
    if (this.cachedTokens.length === 0) {
      this.cachedTokens = await OneClickService.getTokens()
    }
    return options.includeDeprecated
      ? this.cachedTokens
      : this.cachedTokens.filter((t) => !NearIntentsApi.DEPRECATED_ASSET_IDS.includes(t.assetId))
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (OpenAPI.TOKEN) {
      headers['Authorization'] = `Bearer ${OpenAPI.TOKEN}`
    }
    const response = await fetch(`${OpenAPI.BASE}/v0/attestation`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return (await response.json()) as GetAttestationResponse
  }
}
