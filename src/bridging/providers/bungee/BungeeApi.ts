import { log } from '../../../common/utils/log'
import { QuoteResponse } from './types'
import { BridgeProviderQuoteError } from '../../errors'

const BUNGEE_API_URL = 'https://public-backend.bungee.exchange/api/v1'

export interface BungeeApiOptions {
  apiBaseUrl?: string
}

export class BungeeApi {
  constructor(private readonly options: BungeeApiOptions = {}) {}

  // TODO implement quote api

  protected async fetchApi<T>(
    path: string,
    params: Record<string, string>,
    isValidResponse?: (response: unknown) => response is T,
  ): Promise<T> {
    const baseUrl = this.options.apiBaseUrl || BUNGEE_API_URL
    const url = `${baseUrl}${path}?${new URLSearchParams(params).toString()}`

    log(`Fetching Bungee API: GET ${url}. Params: ${JSON.stringify(params)}`)

    const response = await fetch(url, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorBody = await response.json()
      throw new BridgeProviderQuoteError('Bungee Api Error', errorBody)
    }

    // Validate the response
    const json = await response.json()
    if (isValidResponse) {
      if (isValidResponse(json)) {
        return json
      } else {
        throw new BridgeProviderQuoteError(
          `Invalid response for Bungee API call ${path}. The response doesn't pass the validation. Did the API change?`,
          json,
        )
      }
    }

    return json
  }
}

/**
 * Validate the response from the Bungee API is a SuggestedFeesResponse
 *
 * @param response - The response from the Bungee API
 * @returns True if the response is a QuoteResponse, false otherwise
 */
function isValidQuoteResponse(response: unknown): response is QuoteResponse {
  return true
}
