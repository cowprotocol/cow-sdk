import { log } from '../../../common/utils/log'
import { objectToSearchParams } from './util'
import { BungeeQuote, BungeeQuoteAPIRequest, BungeeQuoteAPIResponse, SupportedBridge } from './types'
import { BridgeProviderQuoteError } from '../../errors'

const BUNGEE_API_URL = 'https://public-backend.bungee.exchange/api/v1'

export interface BungeeApiOptions {
  apiBaseUrl?: string
}

export class BungeeApi {
  readonly SUPPORTED_BRIDGES: SupportedBridge[] = ['across', 'cctp']

  constructor(
    private readonly options: BungeeApiOptions = {
      apiBaseUrl: BUNGEE_API_URL,
    },
  ) {}

  /**
   * Makes a GET request to Bungee APIs for quote
   * https://docs.bungee.exchange/bungee-api/api-reference/bungee-controller-quote-v-1
   */
  async getBungeeQuote(params: BungeeQuoteAPIRequest): Promise<BungeeQuote> {
    try {
      // throw if any bridge is not supported
      if (params.includeBridges && params.includeBridges.some((bridge) => !this.SUPPORTED_BRIDGES.includes(bridge))) {
        throw new Error(
          `Unsupported bridge: ${params.includeBridges.filter((bridge) => !this.SUPPORTED_BRIDGES.includes(bridge)).join(', ')}`,
        )
      }
      // if no bridges are provided, use all supported bridges
      if (!params.includeBridges) {
        params.includeBridges = this.SUPPORTED_BRIDGES
      }

      const urlParams = objectToSearchParams(params)
      const response = await this.get<BungeeQuoteAPIResponse>('/quote', urlParams, isValidQuoteResponse)
      if (!response.success) {
        throw new BridgeProviderQuoteError('Bungee Api Error: Not successful', response)
      }
      // prepare quote timestamp from current timestamp
      const quoteTimestamp = Math.floor(Date.now() / 1000)

      // sort manual routes by output
      const { manualRoutes } = response.result
      const sortedManualRoutes = manualRoutes.sort((a, b) => {
        return Number(b.output.amount) - Number(a.output.amount)
      })

      // refactor the response
      const bungeeQuote: BungeeQuote = {
        originChainId: response.result.originChainId,
        destinationChainId: response.result.destinationChainId,
        userAddress: response.result.userAddress,
        receiverAddress: response.result.receiverAddress,
        input: response.result.input,
        route: sortedManualRoutes[0],
        quoteTimestamp,
      }

      return bungeeQuote
    } catch (error) {
      console.error('🔴 Error getting bungee quote:', error)
      throw error
    }
  }

  protected async get<T>(
    path: string,
    params: Record<string, string> | URLSearchParams,
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
function isValidQuoteResponse(response: unknown): response is BungeeQuoteAPIResponse {
  if (typeof response !== 'object' || response === null) {
    return false
  }

  const resp = response as Record<string, unknown>

  // Check top level fields
  if (
    !('success' in resp) ||
    !('statusCode' in resp) ||
    !('result' in resp) ||
    typeof resp.success !== 'boolean' ||
    typeof resp.statusCode !== 'number'
  ) {
    return false
  }

  const result = resp.result
  if (typeof result !== 'object' || result === null) {
    return false
  }

  const res = result as Record<string, unknown>

  // Check required fields in result
  if (
    !('originChainId' in res) ||
    !('destinationChainId' in res) ||
    !('userAddress' in res) ||
    !('receiverAddress' in res) ||
    !('manualRoutes' in res) ||
    !Array.isArray(res.manualRoutes)
  ) {
    return false
  }

  // Validate manual routes array
  return res.manualRoutes.every((route) => {
    if (typeof route !== 'object' || route === null) {
      return false
    }

    const r = route

    // Validate if route.routeDetails.routeFee.amount exists
    if (!('routeFee' in r.routeDetails)) {
      return false
    }
    const routeFee = r.routeDetails.routeFee
    if (typeof routeFee !== 'object' || routeFee === null) {
      return false
    }
    if (!('amount' in routeFee)) {
      return false
    }

    return (
      'quoteId' in r &&
      'quoteExpiry' in r &&
      'output' in r &&
      'gasFee' in r &&
      'slippage' in r &&
      'estimatedTime' in r &&
      'routeDetails' in r
    )
  })
}
