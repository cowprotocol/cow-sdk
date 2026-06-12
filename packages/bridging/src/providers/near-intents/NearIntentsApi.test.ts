import { OneClickService, OpenAPI, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

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

  describe('getTokens', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    // Regression: NEAR Omni migration deprecated `nep141:btc.omft.near` (POA),
    // but the upstream 1Click /v0/tokens endpoint still returns it alongside
    // the new `1cs_v1:btc:native:coin`. Both entries report `blockchain: 'btc'`
    // and both end up matching the BTC_CURRENCY_ADDRESS sentinel through
    // resolveTokenAddress, so without filtering `tokens.find()` would pick
    // the deprecated entry (it appears first in the upstream response) and
    // quote requests would target an asset that the attestation service no
    // longer signs, causing /v0/attestation to fail with "Invalid quote hash".
    it('filters out deprecated nep141:btc.omft.near from the cached token list', async () => {
      const upstream: TokenResponse[] = [
        {
          assetId: 'nep141:btc.omft.near',
          decimals: 8,
          blockchain: TokenResponse.blockchain.BTC,
          symbol: 'BTC',
          price: 60000,
          priceUpdatedAt: '2026-05-18T09:18:00.452Z',
        },
        {
          assetId: '1cs_v1:btc:native:coin',
          decimals: 8,
          blockchain: TokenResponse.blockchain.BTC,
          symbol: 'BTC(OMNI)',
          price: 60000,
          priceUpdatedAt: '2026-05-18T09:18:00.452Z',
          contractAddress: 'coin',
        },
      ]
      jest.spyOn(OneClickService, 'getTokens').mockResolvedValue(upstream as any)

      const api = new NearIntentsApi()
      const tokens = await api.getTokens()

      expect(tokens.map((t) => t.assetId)).toEqual(['1cs_v1:btc:native:coin'])
    })

    it('keeps non-deprecated tokens unchanged', async () => {
      const upstream: TokenResponse[] = [
        {
          assetId: 'nep141:eth.omft.near',
          decimals: 18,
          blockchain: TokenResponse.blockchain.ETH,
          symbol: 'ETH',
          price: 3000,
          priceUpdatedAt: '2026-05-18T09:18:00.452Z',
        },
        {
          assetId: '1cs_v1:btc:native:coin',
          decimals: 8,
          blockchain: TokenResponse.blockchain.BTC,
          symbol: 'BTC(OMNI)',
          price: 60000,
          priceUpdatedAt: '2026-05-18T09:18:00.452Z',
          contractAddress: 'coin',
        },
      ]
      jest.spyOn(OneClickService, 'getTokens').mockResolvedValue(upstream as any)

      const api = new NearIntentsApi()
      const tokens = await api.getTokens()

      expect(tokens).toHaveLength(2)
      expect(tokens.map((t) => t.assetId)).toEqual(
        expect.arrayContaining(['nep141:eth.omft.near', '1cs_v1:btc:native:coin']),
      )
    })
  })
})
