import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { RELAY_API_BASE_URL } from './const'

import type {
  RelayCurrenciesRequest,
  RelayCurrency,
  RelayQuoteRequest,
  RelayQuoteResponse,
  RelayRequestsResponse,
  RelayStatusResponse,
} from './types'

export class RelayApi {
  private baseUrl: string
  private apiKey?: string
  private currencyCache = new Map<string, RelayCurrency[]>()

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl ?? RELAY_API_BASE_URL
    this.apiKey = apiKey
  }

  async getCurrencies(request: RelayCurrenciesRequest): Promise<RelayCurrency[]> {
    const cacheKey = JSON.stringify(request)
    const cached = this.currencyCache.get(cacheKey)
    if (cached) return cached

    const result = await this.fetchJson<RelayCurrency[]>(`${this.baseUrl}/currencies/v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    this.currencyCache.set(cacheKey, result)
    return result
  }

  async getQuote(request: RelayQuoteRequest): Promise<RelayQuoteResponse> {
    return this.fetchJson<RelayQuoteResponse>(`${this.baseUrl}/quote/v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, useDepositAddress: true, strict: true }),
    })
  }

  async getStatus(requestId: string): Promise<RelayStatusResponse> {
    return this.fetchJson<RelayStatusResponse>(
      `${this.baseUrl}/intents/status/v3?requestId=${encodeURIComponent(requestId)}`,
    )
  }

  async getRequests(depositAddress: string): Promise<RelayRequestsResponse> {
    return this.fetchJson<RelayRequestsResponse>(
      `${this.baseUrl}/requests/v2?depositAddress=${encodeURIComponent(depositAddress)}&sortBy=createdAt&sortDirection=desc&limit=1`,
    )
  }

  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    if (this.apiKey) {
      const headers = new Headers(options?.headers)
      headers.set('x-api-key', this.apiKey)
      options = { ...options, headers }
    }

    let response: Response
    try {
      response = await fetch(url, options)
    } catch (error) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.API_ERROR, {
        message: error instanceof Error ? error.message : 'Network error',
      })
    }

    if (!response.ok) {
      let body: string | undefined
      try {
        body = await response.text()
      } catch {
        // ignore
      }

      if (response.status === 404 || response.status === 400) {
        throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, {
          status: response.status,
          body,
        })
      }

      throw new BridgeProviderQuoteError(BridgeQuoteErrors.API_ERROR, {
        status: response.status,
        body,
      })
    }

    return (await response.json()) as T
  }
}
