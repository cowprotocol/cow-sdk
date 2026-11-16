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
  // The Omni migration leaves a dead twin of each migrated asset in /v0/tokens: same
  // `blockchain` and `contractAddress` as the live one, a new `assetId`, and `(DEPRECATED)`
  // appended to the symbol. The dead twin is listed first, so a `find()` by address picks it,
  // /v0/quote still quotes it, and /v0/attestation then refuses to sign it with
  // "Invalid quote hash".
  // https://partners.near-intents.org/omni-migration
  private static readonly DEPRECATED_SYMBOL = /deprecated/i

  // Dead assets the symbol does not catch: `nep141:btc.omft.near` (POA BTC, replaced by
  // `1cs_v1:btc:native:coin`) is still listed as plain `BTC`. The two `9745_` ids are XPL and
  // USDT0 on Plasma; upstream marks them in the symbol today, and they stay listed here in case
  // it stops.
  private static readonly DEPRECATED_ASSET_IDS: ReadonlySet<string> = new Set([
    'nep141:btc.omft.near',
    'nep245:v2_1.omni.hot.tg:9745_3aL9skCy1yhPoDB8oKMmRHRN7SJW',
    'nep245:v2_1.omni.hot.tg:9745_11111111111111111111',
  ])

  private cachedTokens: TokenResponse[] = []

  constructor(apiKey?: string) {
    if (apiKey) {
      OpenAPI.TOKEN = apiKey
    }
  }

  private static isDeprecated(token: TokenResponse): boolean {
    return NearIntentsApi.DEPRECATED_ASSET_IDS.has(token.assetId) || NearIntentsApi.DEPRECATED_SYMBOL.test(token.symbol)
  }

  /**
   * Every asset 1Click lists, deprecated ones included. Resolving the asset of an order placed
   * before a migration needs them; routing a new order does not — use `getRoutableTokens`.
   */
  async getTokens(): Promise<TokenResponse[]> {
    if (this.cachedTokens.length === 0) {
      this.cachedTokens = await OneClickService.getTokens()
    }
    return this.cachedTokens
  }

  /** The assets a new quote may be routed through, i.e. everything `getTokens` returns minus the deprecated twins. */
  async getRoutableTokens(): Promise<TokenResponse[]> {
    return (await this.getTokens()).filter((token) => !NearIntentsApi.isDeprecated(token))
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
        // 1Click lists some assets (e.g. WETH) that it cannot route, report it as a missing route
        if (message && typeof message === 'string' && message.toLowerCase().includes('no liquidity available')) {
          throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, { originalMessage: message })
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
