import { backOff, BackoffOptions } from 'exponential-backoff'
import { RateLimiter } from 'limiter'

export interface FetchParams {
  path: string
  method: 'GET' | 'POST' | 'DELETE' | 'PUT'
  body?: unknown
  query?: URLSearchParams
}

export class OrderBookApiError<T = unknown> {
  constructor(public readonly response: Response, public readonly body: T) {}
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
