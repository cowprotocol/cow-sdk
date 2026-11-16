import { SupportedChainId } from '@cowprotocol/sdk-config'
import { ApiError, OneClickService, OpenAPI, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

import { NearIntentsApi } from './NearIntentsApi'
import { getTokenByAddressAndChainId } from './util'
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

    // The Omni migration left a dead twin of each migrated asset in /v0/tokens, sharing the
    // live one's `contractAddress` and listed ahead of it, so an unfiltered `tokens.find()`
    // by address picks the twin. /v0/quote still quotes it and /v0/attestation then rejects
    // it with "Invalid quote hash".
    const AVAX_USDT_ADDRESS = '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7'

    const avaxUsdtDeprecated: TokenResponse = {
      assetId: 'nep245:v2_1.omni.hot.tg:43114_372BeH7ENZieCaabwkbWkBiTTgXp',
      decimals: 6,
      blockchain: TokenResponse.blockchain.AVAX,
      symbol: 'USDT(DEPRECATED)',
      price: 1,
      priceUpdatedAt: '2026-11-16T09:18:00.452Z',
      contractAddress: AVAX_USDT_ADDRESS,
    }

    const avaxUsdt: TokenResponse = {
      assetId: `nep141:avax-${AVAX_USDT_ADDRESS}.omdep.near`,
      decimals: 6,
      blockchain: TokenResponse.blockchain.AVAX,
      symbol: 'USDT',
      price: 1,
      priceUpdatedAt: '2026-11-16T09:18:00.452Z',
      contractAddress: AVAX_USDT_ADDRESS,
    }

    describe('getRoutableTokens', () => {
      it('drops the twins upstream marks as deprecated in the symbol', async () => {
        jest.spyOn(OneClickService, 'getTokens').mockResolvedValue([avaxUsdtDeprecated, avaxUsdt] as any)

        const tokens = await new NearIntentsApi().getRoutableTokens()

        expect(tokens.map((t) => t.assetId)).toEqual([avaxUsdt.assetId])
      })

      it('drops the dead assets upstream leaves unmarked', async () => {
        jest.spyOn(OneClickService, 'getTokens').mockResolvedValue([btcPoa, btcOmni] as any)

        const tokens = await new NearIntentsApi().getRoutableTokens()

        expect(tokens.map((t) => t.assetId)).toEqual([btcOmni.assetId])
      })

      it('leaves the live twin as the match for a contract address both entries share', async () => {
        jest.spyOn(OneClickService, 'getTokens').mockResolvedValue([avaxUsdtDeprecated, avaxUsdt] as any)

        const tokens = await new NearIntentsApi().getRoutableTokens()
        const match = getTokenByAddressAndChainId(tokens, AVAX_USDT_ADDRESS, SupportedChainId.AVALANCHE)

        expect(match?.assetId).toEqual(avaxUsdt.assetId)
      })

      it('keeps live tokens unchanged', async () => {
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
          .mockResolvedValue([btcPoa, btcOmni, avaxUsdtDeprecated, avaxUsdt] as any)

        const tokens = await new NearIntentsApi().getTokens()

        expect(tokens.map((t) => t.assetId)).toEqual([
          btcPoa.assetId,
          btcOmni.assetId,
          avaxUsdtDeprecated.assetId,
          avaxUsdt.assetId,
        ])
      })

      it('fetches upstream once and caches the result', async () => {
        const upstream = jest.spyOn(OneClickService, 'getTokens').mockResolvedValue([avaxUsdt] as any)

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
