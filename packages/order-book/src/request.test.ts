import { DEFAULT_BACKOFF_OPTIONS, FetchParams, OrderBookApiError, request } from './request'
import fetchMock from 'jest-fetch-mock'
import { BackoffOptions } from 'exponential-backoff'
import { RateLimiter } from 'limiter'

fetchMock.enableMocks()

const URL = 'https://cow.fi'
const ERROR_MESSAGE = '💣💥 Booom!'

const OK_RESPONSE = {
  status: 200,
  ok: true,
  headers: new Headers({
    'Content-Type': 'application/json',
  }),
  json: () => Promise.resolve(OK_RESPONSE),
}

beforeEach(() => {
  fetchMock.mockClear()
})

function mockAndFailUntilAttempt(attempt: number): void {
  let count = 0
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  fetchMock.mockImplementation(() => {
    count++
    // console.log('ATTEMPT', count)
    return count >= attempt ? Promise.resolve(OK_RESPONSE) : Promise.reject(ERROR_MESSAGE)
  })
}

const rateLimiter = new RateLimiter({
  tokensPerInterval: 5,
  interval: 'second',
})
// We use fetchWithRateLimit instead of fetchWithBackoff, since that is just a default config version of fetchWithBackoff
const fetchUrlWithBackoff = (attempts: number) =>
  request(URL, { path: '', method: 'GET' }, rateLimiter, { numOfAttempts: attempts })

describe('Fetch with backoff', () => {
  it('No re-attempt if SUCCESS', async () => {
    // GIVEN: A working API
    mockAndFailUntilAttempt(0)

    // WHEN: Fetch url (backoff up to 10 attempts)
    const result = await fetchUrlWithBackoff(10)

    // THEN: Only one request is needed (no need to re-attempt)
    expect(fetchMock).toBeCalledTimes(1)

    // THEN: The result is OK
    expect(result).toBe(OK_RESPONSE)
  })

  it('3 re-attempts if FAILS 3 times and then SUCCEED', async () => {
    // GIVEN: An API which fails 3 tiems, and then succeeds
    mockAndFailUntilAttempt(3)

    // WHEN: Fetch url (backoff up to 5 attempts)
    const result = await fetchUrlWithBackoff(5)

    // THEN: Only one request is needed
    expect(fetchMock).toBeCalledTimes(3)

    // THEN: The result is OK
    expect(result).toBe(OK_RESPONSE)
  })

  it('SUCCEED in the last attempt', async () => {
    // GIVEN: A API which fails 50 times
    mockAndFailUntilAttempt(3)

    // WHEN: Fetch url (backoff up to 3 attempts)
    const result = await fetchUrlWithBackoff(3)

    // THEN: We only call fetch 3 times
    expect(fetchMock).toBeCalledTimes(3)

    // THEN: The result is OK
    expect(result).toBe(OK_RESPONSE)
  })

  it("Don't reattempt after FAILING the MAXIMUM number of times", async () => {
    // GIVEN: A API which fails 50 times
    mockAndFailUntilAttempt(50)

    // WHEN: Fetch url (backoff up to 3 attempts)
    const fetchPromise = fetchUrlWithBackoff(3)

    // THEN: The result is ERROR
    await expect(fetchPromise).rejects.toBe(ERROR_MESSAGE)

    // THEN: We only call fetch 3 times
    expect(fetchMock).toBeCalledTimes(3)
  })
})

describe('DEFAULT_BACKOFF_OPTIONS retry policy', () => {
  type MockedResponse = { status: number; headers?: Record<string, string> }

  const QUOTE: FetchParams = { path: '/api/v1/quote', method: 'POST', body: { kind: 'sell' } }
  const NOW = new Date('2026-11-18T12:00:00.000Z').getTime()

  /** Offsets (ms since the request started) at which fetch was called. */
  let callOffsets: number[]

  /** Responds with `responses` in order, repeating the last one. */
  function mockResponses(...responses: MockedResponse[]): void {
    fetchMock.mockImplementation(() => {
      callOffsets.push(Date.now() - NOW)
      const { status, headers } = responses[Math.min(callOffsets.length, responses.length) - 1] ?? OK
      const body = status === 200 ? { ok: true } : { errorType: 'SomeError', description: 'failed' }

      return Promise.resolve(
        new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } }),
      )
    })
  }

  async function run(
    backoffOpts: BackoffOptions = DEFAULT_BACKOFF_OPTIONS,
    rateLimiter = new RateLimiter({ tokensPerInterval: 1000, interval: 'second' }),
  ): Promise<{ result?: unknown; error?: OrderBookApiError }> {
    const outcome = request(URL, QUOTE, rateLimiter, backoffOpts).then(
      (result) => ({ result }),
      (error: OrderBookApiError) => ({ error }),
    )
    await jest.runAllTimersAsync()

    return outcome
  }

  const rateLimited = (headers?: Record<string, string>): MockedResponse => ({ status: 429, headers })
  const OK: MockedResponse = { status: 200 }

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW })
    fetchMock.resetMocks()
    callOffsets = []
  })

  afterEach(() => {
    // Every retry wait has been resolved: nothing is left scheduled
    expect(jest.getTimerCount()).toBe(0)
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('HTTP 429', () => {
    it.each([
      ['delay-seconds', '2', 2000],
      ['HTTP-date', new Date(NOW + 3000).toUTCString(), 3000],
      ['zero delay-seconds', '0', 0],
      ['HTTP-date in the past', new Date(NOW - 60_000).toUTCString(), 0],
      ['padded delay-seconds', ' 1 ', 1000],
    ])('waits for Retry-After (%s) before retrying', async (_, retryAfter, retryAfterMs) => {
      mockResponses(rateLimited({ 'Retry-After': retryAfter }), OK)

      const { result } = await run()

      expect(result).toEqual({ ok: true })
      // The retry is never sent before Retry-After; exponential-backoff adds its own 100 ms first-retry delay
      expect(callOffsets).toEqual([0, retryAfterMs + 100])
    })

    it.each([
      ['missing', undefined],
      ['not a number or date', 'soon'],
      ['negative', '-1'],
      ['fractional', '1.5'],
    ])('falls back to a jittered delay when Retry-After is %s', async (_, retryAfter) => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5)
      mockResponses(rateLimited(retryAfter === undefined ? undefined : { 'Retry-After': retryAfter }), OK)

      const { result } = await run()

      expect(result).toEqual({ ok: true })
      // Full jitter over [0, 1000) ms -> 500 ms, plus the 100 ms backoff delay
      expect(callOffsets).toEqual([0, 600])
    })

    it.each([0, 0.25, 0.999])(
      'keeps the fallback jitter within [0, 1000 * 2^(retry - 1)) ms (random = %s)',
      async (random) => {
        jest.spyOn(Math, 'random').mockReturnValue(random)
        mockResponses(rateLimited())

        await run()

        const [first, second, third] = callOffsets as [number, number, number]
        expect(second - first).toBeCloseTo(100 + random * 1000)
        expect(third - second).toBeCloseTo(200 + random * 2000)
      },
    )

    it('does not shorten Retry-After with jitter', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0)
      mockResponses(rateLimited({ 'Retry-After': '2' }), OK)

      await run()

      expect(callOffsets).toEqual([0, 2100])
    })

    it.each(['6', '3600', '99999999999999999999999', new Date(NOW + 60_000).toUTCString()])(
      'returns the error immediately when Retry-After (%s) exceeds the 5 s wait limit',
      async (retryAfter) => {
        mockResponses(rateLimited({ 'Retry-After': retryAfter }), OK)

        const { error } = await run()

        expect(callOffsets).toEqual([0])
        expect(error).toBeInstanceOf(OrderBookApiError)
        expect(error?.response.status).toBe(429)
      },
    )

    it('retries a persistent 429 at most twice and bounds the total wait', async () => {
      mockResponses(rateLimited({ 'Retry-After': '5' }))

      const { error } = await run()

      // 1 request + 2 retries, instead of 10 requests over ~51 s
      expect(callOffsets).toEqual([0, 5100, 10_300])
      expect(error?.response.status).toBe(429)
    })

    it('does not retry a 429 that follows two failed attempts', async () => {
      mockResponses({ status: 500 }, { status: 502 }, rateLimited({ 'Retry-After': '1' }), OK)

      const { error } = await run()

      expect(callOffsets).toEqual([0, 100, 300])
      expect(error?.response.status).toBe(429)
    })

    it('keeps retrying 5xx after a retried 429, within numOfAttempts', async () => {
      mockResponses(rateLimited({ 'Retry-After': '1' }), { status: 503 }, OK)

      const { result } = await run()

      expect(result).toEqual({ ok: true })
      expect(callOffsets).toEqual([0, 1100, 1300])
    })

    it('still takes a rate limiter token for each retry', async () => {
      mockResponses(rateLimited({ 'Retry-After': '0' }), OK)

      await run(DEFAULT_BACKOFF_OPTIONS, new RateLimiter({ tokensPerInterval: 1, interval: 'second' }))

      expect(callOffsets).toHaveLength(2)
      expect(callOffsets[1]).toBeGreaterThanOrEqual(1000)
    })
  })

  describe('other statuses (unchanged)', () => {
    it('retries 5xx up to 10 attempts with the same exponential schedule, ignoring Retry-After', async () => {
      mockResponses({ status: 503, headers: { 'Retry-After': '30' } })

      const { error } = await run()

      expect(callOffsets).toEqual([0, 100, 300, 700, 1500, 3100, 6300, 12_700, 25_500, 51_100])
      expect(error?.response.status).toBe(503)
    })

    it.each([400, 403, 404])('does not retry %s', async (status) => {
      mockResponses({ status })

      const { error } = await run()

      expect(callOffsets).toEqual([0])
      expect(error?.response.status).toBe(status)
    })

    it('passes custom backoff options through without the 429 policy', async () => {
      mockResponses(rateLimited({ 'Retry-After': '2' }))

      await run({ numOfAttempts: 3 })

      expect(callOffsets).toEqual([0, 100, 300])
    })
  })
})

describe('OrderBookApiError', () => {
  it('exposes Retry-After and rate-limit headers, keeping response and body', () => {
    jest.useFakeTimers({ now: 0 })
    const body = { errorType: 'TooManyRequests', description: 'slow down' }
    const response = new Response(JSON.stringify(body), {
      status: 429,
      statusText: 'Too Many Requests',
      headers: {
        'Retry-After': '7',
        'RateLimit-Limit': '10',
        'RateLimit-Remaining': '0',
        'RateLimit-Reset': '7',
        RateLimit: 'limit=10, remaining=0, reset=7',
        'X-RateLimit-Limit': '10',
        'X-Request-Id': 'abc',
        'Content-Type': 'application/json',
      },
    })

    const error = new OrderBookApiError(response, body)
    jest.useRealTimers()

    expect(error.retryAfterMs).toBe(7000)
    expect(error.rateLimitHeaders).toEqual({
      'retry-after': '7',
      'ratelimit-limit': '10',
      'ratelimit-remaining': '0',
      'ratelimit-reset': '7',
      ratelimit: 'limit=10, remaining=0, reset=7',
      'x-ratelimit-limit': '10',
    })
    expect(error.response).toBe(response)
    expect(error.response.status).toBe(429)
    expect(error.body).toBe(body)
    expect(error.message).toBe('Too Many Requests')
  })

  it('has no rate-limit details when the headers are absent', () => {
    const error = new OrderBookApiError(new Response('nope', { status: 400 }), 'nope')

    expect(error.retryAfterMs).toBeUndefined()
    expect(error.rateLimitHeaders).toEqual({})
    expect(error.message).toBe('nope')
  })

  it('can still be built from a response without headers', () => {
    const error = new OrderBookApiError({ status: 500, statusText: 'Internal Server Error' } as Response, undefined)

    expect(error.retryAfterMs).toBeUndefined()
    expect(error.rateLimitHeaders).toEqual({})
  })
})
