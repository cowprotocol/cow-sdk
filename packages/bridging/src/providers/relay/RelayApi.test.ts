import { RelayApi } from './RelayApi'

const BASE_URL = 'https://test.relay.link'

describe('RelayApi', () => {
  const mockFetch = jest.fn()

  beforeAll(() => {
    global.fetch = mockFetch
  })

  beforeEach(() => {
    mockFetch.mockReset()
  })

  function mockOk(data: unknown) {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => data,
    } as any)
  }

  function mockError(status: number, body = 'Error') {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status,
      text: async () => body,
    } as any)
  }

  describe('getCurrencies', () => {
    it('sends correct POST request', async () => {
      const api = new RelayApi(BASE_URL)
      const currencies = [{ chainId: 8453, address: '0xusdc', symbol: 'USDC', name: 'USD Coin', decimals: 6 }]
      mockOk(currencies)

      const result = await api.getCurrencies({ chainIds: [8453], depositAddressOnly: true })

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/currencies/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainIds: [8453], depositAddressOnly: true }),
      })
      expect(result).toEqual(currencies)
    })

    it('caches results for same request', async () => {
      const api = new RelayApi(BASE_URL)
      mockOk([])

      await api.getCurrencies({ chainIds: [1] })
      await api.getCurrencies({ chainIds: [1] })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('does not cache for different requests', async () => {
      const api = new RelayApi(BASE_URL)
      mockOk([])
      mockOk([])

      await api.getCurrencies({ chainIds: [1] })
      await api.getCurrencies({ chainIds: [8453] })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('getQuote', () => {
    it('sends correct POST request with useDepositAddress', async () => {
      const api = new RelayApi(BASE_URL)
      const quoteResponse = { steps: [], fees: {}, details: {} }
      mockOk(quoteResponse)

      const request = {
        user: '0xuser',
        originChainId: 8453,
        destinationChainId: 1,
        originCurrency: '0xusdc',
        destinationCurrency: '0xusdc-eth',
        amount: '1000000',
        tradeType: 'EXACT_INPUT' as const,
        useDepositAddress: true,
        strict: true,
      }
      await api.getQuote(request)

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/quote/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    })

    it('enforces useDepositAddress: true and strict: true even if caller omits them', async () => {
      const api = new RelayApi(BASE_URL)
      mockOk({ steps: [], fees: {}, details: {} })

      const request = {
        user: '0xuser',
        originChainId: 8453,
        destinationChainId: 1,
        originCurrency: '0xusdc',
        destinationCurrency: '0xusdc-eth',
        amount: '1000000',
        tradeType: 'EXACT_INPUT' as const,
        useDepositAddress: false,
        strict: false,
      }
      await api.getQuote(request)

      const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(sentBody.useDepositAddress).toBe(true)
      expect(sentBody.strict).toBe(true)
    })
  })

  describe('getStatus', () => {
    it('sends correct GET request with requestId', async () => {
      const api = new RelayApi(BASE_URL)
      mockOk({ status: 'success' })

      await api.getStatus('0xrequest123')

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/intents/status/v3?requestId=0xrequest123`, undefined)
    })
  })

  describe('getRequests', () => {
    it('sends correct GET request with depositAddress', async () => {
      const api = new RelayApi(BASE_URL)
      mockOk({ requests: [], continuation: null })

      await api.getRequests('0xdeposit123')

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/requests/v2?depositAddress=0xdeposit123&sortBy=createdAt&sortDirection=desc&limit=1`,
        undefined,
      )
    })
  })

  describe('error handling', () => {
    it('throws NO_ROUTES for 404', async () => {
      const api = new RelayApi(BASE_URL)
      mockError(404)

      await expect(api.getCurrencies({})).rejects.toThrow('NO_ROUTES')
    })

    it('throws NO_ROUTES for 400', async () => {
      const api = new RelayApi(BASE_URL)
      mockError(400)

      await expect(api.getQuote({} as any)).rejects.toThrow('NO_ROUTES')
    })

    it('throws API_ERROR for 500', async () => {
      const api = new RelayApi(BASE_URL)
      mockError(500)

      await expect(api.getStatus('0x123')).rejects.toThrow('API_ERROR')
    })

    it('throws API_ERROR on network failure', async () => {
      const api = new RelayApi(BASE_URL)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(api.getStatus('0x123')).rejects.toThrow('API_ERROR')
    })
  })

  describe('api key', () => {
    it('adds x-api-key header when api key is set', async () => {
      const api = new RelayApi(BASE_URL, 'test-api-key')
      mockOk([])

      await api.getCurrencies({ chainIds: [1] })

      const [, options] = mockFetch.mock.calls[0] as [RequestInfo, RequestInit]
      const headers = new Headers(options.headers)
      expect(headers.get('x-api-key')).toBe('test-api-key')
    })

    it('does not add x-api-key header when api key is not set', async () => {
      const api = new RelayApi(BASE_URL)
      mockOk([])

      await api.getCurrencies({ chainIds: [1] })

      const [, options] = mockFetch.mock.calls[0] as [RequestInfo, RequestInit]
      const headers = new Headers(options.headers)
      expect(headers.get('x-api-key')).toBeNull()
    })
  })
})
