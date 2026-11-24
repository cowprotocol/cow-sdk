import { backOff, BackoffOptions } from 'exponential-backoff'
import { RateLimiter, RateLimiterOpts } from 'limiter'

/**
 * Error thrown when the CoW Protocol OrderBook API returns an error.
 */
export class OrderBookApiError<T = unknown> extends Error {
  /**
   * How long the API asked the client to wait before a new request, in milliseconds, from the `Retry-After` header
   * (delay-seconds or HTTP-date, measured when the error was created). `undefined` if the header is absent or invalid.
   */
  public readonly retryAfterMs?: number

  /**
   * The `Retry-After`, `RateLimit*` and `X-RateLimit-*` response headers, keyed by lower-case name.
   */
  public readonly rateLimitHeaders: Record<string, string>

  /**
   * Error thrown when the CoW Protocol OrderBook API returns an error.
   * @param response The response from the CoW Protocol OrderBook API.
   * @param body The body of the response.
   * @constructor
   */
  constructor(
    public readonly response: Response,
    public readonly body: T,
  ) {
    super(typeof body === 'string' ? body : response.statusText)
    this.rateLimitHeaders = getRateLimitHeaders(response.headers)
    this.retryAfterMs = parseRetryAfterMs(this.rateLimitHeaders['retry-after'])
  }
}

const RATE_LIMIT_HEADER = /^(retry-after|ratelimit(-.+)?|x-ratelimit-.+)$/

function getRateLimitHeaders(headers: Headers | undefined): Record<string, string> {
  const rateLimitHeaders: Record<string, string> = {}

  headers?.forEach((value, name) => {
    const key = name.toLowerCase()
    if (RATE_LIMIT_HEADER.test(key)) rateLimitHeaders[key] = value
  })

  return rateLimitHeaders
}

/**
 * Parses a `Retry-After` value (RFC 9110, section 10.2.3) into milliseconds from now.
 * A date in the past gives `0`; a malformed value gives `undefined`.
 */
function parseRetryAfterMs(value: string | undefined): number | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  if (/^\d+$/.test(trimmed)) return Number(trimmed) * 1000

  // An HTTP-date always contains letters (day and month names). Requiring one rejects values such as "-1" or "1.5",
  // which Date.parse would otherwise read as dates.
  const date = /[a-z]/i.test(trimmed) ? Date.parse(trimmed) : NaN

  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now())
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
  INTERNAL_SERVER_ERROR,
  BAD_GATEWAY,
  SERVICE_UNAVAILABLE,
  GATEWAY_TIMEOUT,
]

/** A 429 is only retried after the first or second attempt, so it is retried at most twice. */
const MAX_RATE_LIMIT_RETRIES = 2
/** Longest wait before retrying a 429. A longer `Retry-After` is returned to the caller instead. */
const MAX_RATE_LIMIT_DELAY_MS = 5_000
/** Upper bound of the random wait before the first retry of a 429 without a valid `Retry-After`; doubles after. */
const RATE_LIMIT_FALLBACK_DELAY_MS = 1_000

function retryRateLimited(error: OrderBookApiError, attemptNumber: number): boolean | Promise<boolean> {
  if (attemptNumber > MAX_RATE_LIMIT_RETRIES) return false

  const delayMs = error.retryAfterMs ?? Math.random() * RATE_LIMIT_FALLBACK_DELAY_MS * 2 ** (attemptNumber - 1)
  if (delayMs > MAX_RATE_LIMIT_DELAY_MS) return false

  return new Promise((resolve) => setTimeout(() => resolve(true), delayMs))
}

/**
 * The default backoff options for CoW Protocol's API.
 *
 * - `408`, `425`, `5xx` and network errors: up to 10 attempts with exponential backoff.
 * - `429`: at most 2 retries. Each waits for `Retry-After`, or a random delay when it is absent, before the usual
 *   backoff delay. A `Retry-After` above 5 s is returned to the caller without retrying.
 * - Other errors are not retried.
 *
 * Custom `backoffOpts` replace these options entirely; spread them to keep the retry rules. The 429 wait runs in
 * `retry`, before `numOfAttempts` is checked, so keep `numOfAttempts` above 2 when reusing it.
 * @see {@link Backoff configuration: https://www.npmjs.com/package/@insertish/exponential-backoff}
 */
export const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  numOfAttempts: 10,
  maxDelay: Infinity,
  jitter: 'none',
  retry: (error: Error | OrderBookApiError, attemptNumber: number) => {
    if (error instanceof OrderBookApiError) {
      if (error.response.status === TOO_MANY_REQUESTS) return retryRateLimited(error, attemptNumber)

      return STATUS_CODES_TO_RETRY.includes(error.response.status)
    }

    return true
  },
}

/**
 * The default rate limiter options for CoW Protocol's API.
 *
 * This only throttles requests on the client side. The API enforces its own limits, which differ per endpoint:
 * @see {@link https://docs.cow.fi/cow-protocol/integrate/api#rate-limits}
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
 * @param additionalHeaders Optional additional headers (e.g. X-API-Key for Partner API).
 * @returns The response of the request.
 * @throws If the API returns an error or if the request fails.
 */
export async function request<T>(
  baseUrl: string,
  { path, query, method, body }: FetchParams,
  rateLimiter: RateLimiter,
  backoffOpts: BackoffOptions,
  additionalHeaders?: Record<string, string>,
): Promise<T> {
  const queryString = query ? '?' + query : ''
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...additionalHeaders,
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
