import { BridgeProviderError, BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { SOCKET_BASE_URL, SOCKET_DEDICATED_BASE_URL } from './const'
import {
  SocketApiOptions,
  SocketQuoteRequest,
  SocketQuoteResponse,
  SocketStatusResponse,
  SocketToken,
  SocketTokenListResponse,
} from './types'

export class SocketApi {
  private readonly apiBaseUrl: string

  constructor(private readonly options: SocketApiOptions = {}) {
    this.apiBaseUrl = options.apiBaseUrl ?? (options.apiKey ? SOCKET_DEDICATED_BASE_URL : SOCKET_BASE_URL)
  }

  async getTokens(chainIds: number[]): Promise<SocketToken[]> {
    const response = await this.makeApiCall<SocketTokenListResponse>('/v3/swap/tokens/list', {
      chainIds: chainIds.join(','),
      list: 'full',
    })

    if (!response.success) {
      throw new BridgeProviderError('Socket Api Error: token list failed', response)
    }

    return chainIds.flatMap((chainId) => response.result[String(chainId)] ?? [])
  }

  async getQuote(request: SocketQuoteRequest): Promise<SocketQuoteResponse> {
    const response = await this.makeApiCall<SocketQuoteResponse>('/v3/swap/quote', request)

    if (!response.success) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.QUOTE_ERROR, response)
    }

    return response
  }

  async getStatus(quoteId: string): Promise<SocketStatusResponse> {
    const response = await this.makeApiCall<SocketStatusResponse>('/v3/swap/status', {
      quoteId,
    })

    if (!response.success) {
      throw new BridgeProviderError('Socket Api Error: status failed', response)
    }

    return response
  }

  private async makeApiCall<T>(path: string, params: object): Promise<T> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const url = `${this.apiBaseUrl}${path}?${searchParams.toString()}`
    const headers: Record<string, string> = {}

    if (this.options.apiKey) {
      headers['x-api-key'] = this.options.apiKey
    }

    if (this.options.affiliate) {
      headers['affiliate'] = this.options.affiliate
    }

    const response = await fetch(url, { method: 'GET', headers })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => undefined)
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.API_ERROR, {
        status: response.status,
        errorBody,
      })
    }

    return (await response.json()) as T
  }
}
