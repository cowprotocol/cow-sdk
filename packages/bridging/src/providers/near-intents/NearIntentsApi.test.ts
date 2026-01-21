import { OpenAPI } from '@defuse-protocol/one-click-sdk-typescript'

import { NearIntentsApi } from './NearIntentsApi'

const TEST_API_TOKEN = 'test-api-token'

describe('NearIntentsApi', () => {
  const mockFetch = jest.fn()

  beforeAll(() => {
    global.fetch = mockFetch
  })

  beforeEach(() => {
    mockFetch.mockReset()
    OpenAPI.BASE = 'https://api.near-intents.example'
    OpenAPI.TOKEN = undefined as any
  })

  it('adds Authorization header when api key is set', async () => {
    const api = new NearIntentsApi(TEST_API_TOKEN)

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ signature: '0xsignature', version: 1 }),
    } as any)

    await api.getAttestation({
      depositAddress: '0xdeposit' as any,
      quoteHash: '0xquotehash' as any,
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [, options] = mockFetch.mock.calls[0] as [RequestInfo, RequestInit]

    expect(options.headers).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_TOKEN}`,
      }),
    )
  })

  it("doesn't add Authorization header when api key is not set", async () => {

    const api = new NearIntentsApi()

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ signature: '0xsignature', version: 1 }),
    } as any)

    await api.getAttestation({
      depositAddress: '0xdeposit' as any,
      quoteHash: '0xquotehash' as any,
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [, options] = mockFetch.mock.calls[0] as [RequestInfo, RequestInit]

    expect(options.headers).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    )
    expect(options.headers).not.toEqual(
      expect.objectContaining({
        Authorization: expect.any(String),
      }),
    )
  })
})

