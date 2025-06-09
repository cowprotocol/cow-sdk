import { request } from './request'
import fetchMock from 'jest-fetch-mock'
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

function mockAndFailUntilAttempt(attempt: number) {
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
