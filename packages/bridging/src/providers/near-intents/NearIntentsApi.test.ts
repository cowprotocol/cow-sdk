import { ApiError, OneClickService, OpenAPI, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

import { NearIntentsApi } from './NearIntentsApi'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'

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

  describe('tokens', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    const btcPoa: TokenResponse = {
      assetId: 'nep141:btc.omft.near',
      decimals: 8,
      blockchain: TokenResponse.blockchain.BTC,
      symbol: 'BTC',
      price: 60000,
      priceUpdatedAt: '2026-05-18T09:18:00.452Z',
    }

    const btcOmni: TokenResponse = {
      assetId: '1cs_v1:btc:native:coin',
      decimals: 8,
      blockchain: TokenResponse.blockchain.BTC,
      symbol: 'BTC(OMNI)',
      price: 60000,
      priceUpdatedAt: '2026-05-18T09:18:00.452Z',
      contractAddress: 'coin',
    }

    const bnbHotDeprecated: TokenResponse = {
      assetId: 'nep245:v2_1.omni.hot.tg:56_11111111111111111111',
      decimals: 18,
      blockchain: TokenResponse.blockchain.BSC,
      symbol: 'BNB(DEPRECATED)',
      price: 600,
      priceUpdatedAt: '2026-11-09T00:00:00.000Z',
    }

    const bnbOmni: TokenResponse = {
      assetId: 'nep141:bnb.omdep.near',
      decimals: 18,
      blockchain: TokenResponse.blockchain.BSC,
      symbol: 'BNB',
      price: 600,
      priceUpdatedAt: '2026-11-09T00:00:00.000Z',
    }

    describe('getRoutableTokens', () => {
      // Regression: NEAR Omni migration deprecated `nep141:btc.omft.near` (POA),
      // but the upstream 1Click /v0/tokens endpoint still returns it alongside
      // the new `1cs_v1:btc:native:coin`. Both entries report `blockchain: 'btc'`
      // and both end up matching the BTC_CURRENCY_ADDRESS sentinel through
      // resolveTokenAddress, so without filtering `tokens.find()` would pick
      // the deprecated entry (it appears first in the upstream response) and
      // quote requests would target an asset that the attestation service no
      // longer signs, causing /v0/attestation to fail with "Invalid quote hash".
      it('filters out deprecated nep141:btc.omft.near', async () => {
        jest.spyOn(OneClickService, 'getTokens').mockResolvedValue([btcPoa, btcOmni] as any)

        const tokens = await new NearIntentsApi().getRoutableTokens()

        expect(tokens.map((t) => t.assetId)).toEqual([btcOmni.assetId])
      })

      // Regression: EVM Omni HOT→nep141 migration (2026-11-09) deprecated BNB /
      // Polygon / Avalanche HOT nep245 IDs, but /v0/tokens still returns them
      // alongside Omni nep141:….omdep.near replacements. They share
      // (blockchain, contractAddress), so without filtering `tokens.find()`
      // picks the deprecated entry first and attestation/quotes break.
      // https://docs.near-intents.org/changelog/entries/2026-11-09-evm-omni-token-ids
      it('filters out deprecated BNB HOT nep245 while keeping Omni nep141 replacement', async () => {
        jest.spyOn(OneClickService, 'getTokens').mockResolvedValue([bnbHotDeprecated, bnbOmni] as any)

        const tokens = await new NearIntentsApi().getRoutableTokens()

        expect(tokens.map((t) => t.assetId)).toEqual([bnbOmni.assetId])
      })

      it('keeps non-deprecated tokens unchanged', async () => {
        const eth: TokenResponse = {
          assetId: 'nep141:eth.omft.near',
          decimals: 18,
          blockchain: TokenResponse.blockchain.ETH,
          symbol: 'ETH',
          price: 3000,
          priceUpdatedAt: '2026-05-18T09:18:00.452Z',
        }
        jest.spyOn(OneClickService, 'getTokens').mockResolvedValue([eth, btcOmni] as any)

        const tokens = await new NearIntentsApi().getRoutableTokens()

        expect(tokens.map((t) => t.assetId)).toEqual([eth.assetId, btcOmni.assetId])
      })
    })

    describe('getTokens', () => {
      // Orders placed before a migration name the deprecated asset, and getBridgingParams
      // resolves them by assetId to report their status.
      it('keeps deprecated assets', async () => {
        jest
          .spyOn(OneClickService, 'getTokens')
          .mockResolvedValue([btcPoa, btcOmni, bnbHotDeprecated, bnbOmni] as any)

        const tokens = await new NearIntentsApi().getTokens()

        expect(tokens.map((t) => t.assetId)).toEqual([
          btcPoa.assetId,
          btcOmni.assetId,
          bnbHotDeprecated.assetId,
          bnbOmni.assetId,
        ])
      })

      it('fetches upstream once and caches the result', async () => {
        const upstream = jest.spyOn(OneClickService, 'getTokens').mockResolvedValue([bnbOmni] as any)

        const api = new NearIntentsApi()
        await api.getTokens()
        await api.getRoutableTokens()

        expect(upstream).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('getQuote', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    const apiError = (message: string) =>
      new ApiError(
        { method: 'POST', url: '/v0/quote' },
        { url: '/v0/quote', ok: false, status: 400, statusText: 'Bad Request', body: { message } },
        message,
      )

    // 1Click lists assets such as mainnet WETH that it cannot route. Reporting that as NO_ROUTES lets the
    // bridging SDK fall back to another intermediate token instead of failing the whole quote.
    it('maps "No liquidity available" to a NO_ROUTES error', async () => {
      jest.spyOn(OneClickService, 'getQuote').mockRejectedValue(apiError('No liquidity available'))

      const error = await new NearIntentsApi().getQuote({} as any).catch((e) => e)

      expect(error).toBeInstanceOf(BridgeProviderQuoteError)
      expect(error.message).toBe(BridgeQuoteErrors.NO_ROUTES)
      expect(error.context).toEqual({ originalMessage: 'No liquidity available' })
    })

    it('rethrows other API errors unchanged', async () => {
      const original = apiError('refundTo is not valid')
      jest.spyOn(OneClickService, 'getQuote').mockRejectedValue(original)

      await expect(new NearIntentsApi().getQuote({} as any)).rejects.toBe(original)
    })
  })
})
