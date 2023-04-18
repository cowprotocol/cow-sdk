import { backOff, BackoffOptions } from 'exponential-backoff'
import { RateLimiter, RateLimiterOpts } from 'limiter'

export class OrderBookApiError<T = unknown> extends Error {
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

// See config in https://www.npmjs.com/package/@insertish/exponential-backoff
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

// CowSwap order-book API is limited by 5 requests per second from one IP
export const DEFAULT_LIMITER_OPTIONS: RateLimiterOpts = {
  tokensPerInterval: 5,
  interval: 'second',
}

export interface FetchParams {
  path: string
  method: 'GET' | 'POST' | 'DELETE' | 'PUT'
  body?: unknown
  query?: URLSearchParams
}

const getResponseBody = async (response: Response): Promise<any> => {
  if (response.status !== 204) {
    try {
      const contentType = response.headers.get('Content-Type')
      if (contentType) {
        const isJSON = contentType.toLowerCase().startsWith('application/json')
        if (isJSON) {
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
  const init: RequestInit = { method, body: body ? JSON.stringify(body) : undefined, headers }

  return backOff<T>(async () => {
    await rateLimiter.removeTokens(1)

    const response = await fetch(url, init)
    const responseBody = await getResponseBody(response)

    // Successful response
    if (response.status >= 200 && response.status < 300) {
      return responseBody
    }

    return Promise.reject(new OrderBookApiError(response, responseBody))
  }, backoffOpts)
}
