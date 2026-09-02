import fetchMock from 'jest-fetch-mock'

import { JupiterAPI } from './jupiterApi'

fetchMock.enableMocks()

beforeEach(() => {
  fetchMock.mockClear()
})

describe('JupiterAPI.getOrder', () => {
  const request = {
    inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    outputMint: 'So11111111111111111111111111111111111111112',
    amount: '1000000000',
    swapMode: 'ExactIn' as const,
  }

  function mockValidResponse(overrides: Record<string, unknown> = {}): void {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        inputMint: request.inputMint,
        outputMint: request.outputMint,
        inAmount: '1000000000',
        outAmount: '9707507795',
        swapMode: 'ExactIn',
        slippageBps: 50,
        ...overrides,
      }),
    )
  }

  it('calls the Jupiter order endpoint with the expected query params', async () => {
    mockValidResponse()

    const api = new JupiterAPI()
    const order = await api.getOrder(request)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = new URL(fetchMock.mock.calls[0]?.[0] as string)
    expect(calledUrl.origin + calledUrl.pathname).toBe('https://ultra-api.jup.ag/order')
    expect(calledUrl.searchParams.get('inputMint')).toBe(request.inputMint)
    expect(calledUrl.searchParams.get('outputMint')).toBe(request.outputMint)
    expect(calledUrl.searchParams.get('amount')).toBe(request.amount)
    expect(calledUrl.searchParams.get('swapMode')).toBe('ExactIn')
    expect(calledUrl.searchParams.get('clientPlatform')).toBeTruthy()
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal)

    expect(order).toEqual({
      inputMint: request.inputMint,
      outputMint: request.outputMint,
      inAmount: '1000000000',
      outAmount: '9707507795',
      swapMode: 'ExactIn',
      slippageBps: 50,
    })
  })

  it('throws the API-provided error message on a non-ok response', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Invalid outputMint' }), { status: 400 })

    const api = new JupiterAPI()

    await expect(api.getOrder(request)).rejects.toThrow('Invalid outputMint')
  })

  it('throws a clean status-based error when the error body is not valid JSON', async () => {
    fetchMock.mockResponseOnce('not json', { status: 502 })

    const api = new JupiterAPI()

    await expect(api.getOrder(request)).rejects.toThrow('Jupiter quote request failed (502)')
  })

  it('rejects a response whose echoed pair does not match the request', async () => {
    mockValidResponse({ outputMint: 'some-other-mint' })

    const api = new JupiterAPI()

    await expect(api.getOrder(request)).rejects.toThrow('malformed or does not match')
  })

  it('rejects a response with a non-numeric amount', async () => {
    mockValidResponse({ outAmount: 'not-a-number' })

    const api = new JupiterAPI()

    await expect(api.getOrder(request)).rejects.toThrow('malformed or does not match')
  })

  it('rejects a response missing required fields', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ swapMode: 'ExactIn' }))

    const api = new JupiterAPI()

    await expect(api.getOrder(request)).rejects.toThrow('malformed or does not match')
  })
})
