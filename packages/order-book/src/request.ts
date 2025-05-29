import { backOff, BackoffOptions } from 'exponential-backoff'
import { RateLimiter, RateLimiterOpts } from 'limiter'

/**
 * Error thrown when the CoW Protocol OrderBook API returns an error.
 */
export class OrderBookApiError<T = unknown> extends Error {
  /**
   * Error thrown when the CoW Protocol OrderBook API returns an error.
   * @param response The response from the CoW Protocol OrderBook API.
   * @param body The body of the response.
   * @constructor
   */
  constructor(public readonly response: Response, public readonly body: T) {
    super(typeof body === 'string' ? body : response.statusText)
  }
}

const REQUEST_TIMEOUT = 408
const TOO_EARLY = 425
const TOO_MANY_REQUESTS = 429
const INTERNAL_SERVER_ERROR = 500
const BAD_GATEWAY = 502
const SERVICE_UNAVAILABLE = 503
const GATEWAY_TIMEOUT = 504

const STATUS_CODES_TO_RETRY = [
  REQUEST_TIMEOUT,
  TOO_EARLY,
  TOO_MANY_REQUESTS,
  INTERNAL_SERVER_ERROR,
  BAD_GATEWAY,
  SERVICE_UNAVAILABLE,
  GATEWAY_TIMEOUT,
]

/**
 * The default backoff options for CoW Protocol's API
 * @see {@link Backoff configuration: https://www.npmjs.com/package/@insertish/exponential-backoff}
 */
export const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  numOfAttempts: 10,
  maxDelay: Infinity,
  jitter: 'none',
  retry: (error: Error | OrderBookApiError) => {
    if (error instanceof OrderBookApiError) {
      return STATUS_CODES_TO_RETRY.includes(error.response.status)
    }

    return true
  },
}

/**
 * The default rate limiter options for CoW Protocol's API.
 *
 * **CAUTION**: The CoW Protocol OrderBook API is limited to 5 requests per second per IP.
 */
export const DEFAULT_LIMITER_OPTIONS: RateLimiterOpts = {
  tokensPerInterval: 5,
  interval: 'second',
}

/**
 * Describe the parameters for a fetch request.
 */
export interface FetchParams {
  path: string
  method: 'GET' | 'POST' | 'DELETE' | 'PUT'
  body?: unknown
  query?: URLSearchParams
}

const getResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status !== 204) {
    try {
      const contentType = response.headers.get('Content-Type')
      if (contentType) {
        if (contentType.toLowerCase().startsWith('application/json')) {
          return await response.json()
        } else {
          return await response.text()
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  return undefined
}

/**
 * Helper function to make a rate-limited request to an API.
 * @param baseUrl The base URL of the API.
 * @param path The path of the request.
 * @param query The query parameters of the request.
 * @param method The HTTP method of the request.
 * @param body The body of the request.
 * @param rateLimiter The rate limiter to use.
 * @param backoffOpts The backoff options to use.
 * @returns The response of the request.
 * @throws If the API returns an error or if the request fails.
 */
export async function request<T>(
  baseUrl: string,
  { path, query, method, body }: FetchParams,
  rateLimiter: RateLimiter,
  backoffOpts: BackoffOptions
): Promise<T> {
  const queryString = query ? '?' + query : ''
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  const url = `${baseUrl}${path}${queryString}`
  const bodyContent = (() => {
    if (!body) return undefined

    return typeof body === 'string' ? body : JSON.stringify(body)
  })()
  const init: RequestInit = {
    method,
    body: bodyContent,
    headers,
  }

  return backOff<T>(async () => {
    await rateLimiter.removeTokens(1)

    const response = await fetch(url, init)
    const responseBody = (await getResponseBody(response)) as T

    // Successful response
    if (response.status >= 200 && response.status < 300) {
      return responseBody
    }

    return Promise.reject(new OrderBookApiError(response, responseBody))
  }, backoffOpts)
}
