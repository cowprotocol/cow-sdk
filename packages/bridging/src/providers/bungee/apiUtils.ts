import { AcrossStatusAPIResponse, BungeeApiUrlOptions, BungeeEventsAPIResponse, BungeeQuoteAPIResponse } from './types'
import { DEFAULT_API_OPTIONS } from './consts'

/**
 * Validate the response from the Bungee API is a SuggestedFeesResponse
 *
 * @param response - The response from the Bungee API
 * @returns True if the response is a QuoteResponse, false otherwise
 */
export function isValidQuoteResponse(response: unknown): response is BungeeQuoteAPIResponse {
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

    // Check if routeDetails exists
    if (!('routeDetails' in r) || typeof r.routeDetails !== 'object' || r.routeDetails === null) {
      return false
    }

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

export function isValidBungeeEventsResponse(response: unknown): response is BungeeEventsAPIResponse {
  if (typeof response !== 'object' || response === null) {
    return false
  }

  const resp = response as Record<string, unknown>

  // Check top level fields
  if (!('success' in resp) || !('result' in resp) || typeof resp.success !== 'boolean' || !Array.isArray(resp.result)) {
    return false
  }

  // Validate each event in the result array
  return resp.result.every((event) => {
    if (typeof event !== 'object' || event === null) {
      return false
    }

    const e = event as Record<string, unknown>

    // Check required fields
    return (
      'identifier' in e &&
      'bridgeName' in e &&
      'fromChainId' in e &&
      'isCowswapTrade' in e &&
      'orderId' in e &&
      // 'recipient' in e &&
      'sender' in e &&
      'srcTxStatus' in e &&
      'destTxStatus' in e
    )
  })
}

export function isValidAcrossStatusResponse(response: unknown): response is AcrossStatusAPIResponse {
  if (typeof response !== 'object' || response === null) {
    return false
  }

  const resp = response as Record<string, unknown>

  if (!('status' in resp)) {
    return false
  }

  return true
}

export function isInfrastructureError(status: number): boolean {
  // 5xx server errors, 429 rate limiting, 502/503/504 gateway errors
  return status >= 500 || status === 429
}

export function isClientFetchError(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof Error && error.message?.includes('fetch'))
}

export function resolveApiEndpointFromOptions(
  key: keyof BungeeApiUrlOptions,
  options: Partial<BungeeApiUrlOptions>,
  useFallback: boolean,
  customUrl?: string,
): BungeeApiUrlOptions[typeof key] {
  return useFallback ? DEFAULT_API_OPTIONS[key] : customUrl || options[key] || DEFAULT_API_OPTIONS[key]
}
