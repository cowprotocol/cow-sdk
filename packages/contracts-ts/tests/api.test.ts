import { createAdapters, TEST_ADDRESS } from './setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  Api,
  Environment,
  apiUrl,
  LIMIT_CONCURRENT_REQUESTS,
  QuotePriceQuality,
  GetQuoteErrorType,
  EstimateTradeAmountQuery,
  PlaceOrderQuery,
  GetExecutedSellAmountQuery,
  QuoteQuery,
  ContractsOrderKind as OrderKind,
  ContractsSigningScheme as SigningScheme,
  ContractsOrder as Order,
  OrderBalance,
  PreSignSignature,
  ContractsSignature,
  ContractsEcdsaSignature,
  Eip1271Signature,
  Eip1271SignatureData,
} from '../src'

// Mock fetch for testing
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('API Functions and Classes', () => {
  let adapters: ReturnType<typeof createAdapters>

  const testOrder: Order = {
    sellToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    buyToken: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    sellAmount: '1000000000000000000', // 1 WETH
    buyAmount: '2000000000000000000000', // 2000 DAI
    validTo: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
    feeAmount: '5000000000000000', // 0.005 WETH
    kind: OrderKind.SELL,
    partiallyFillable: false,
    receiver: TEST_ADDRESS,
  }

  const testSignature = {
    scheme: SigningScheme.PRESIGN,
    data: TEST_ADDRESS,
  } as PreSignSignature

  beforeAll(() => {
    adapters = createAdapters()
  })

  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('Constants and Enums', () => {
    test('should have correct LIMIT_CONCURRENT_REQUESTS value', () => {
      expect(LIMIT_CONCURRENT_REQUESTS).toBe(5)
    })

    test('should have correct Environment enum values', () => {
      expect(Environment.Dev).toBe(0)
      expect(Environment.Prod).toBe(1)
    })

    test('should have correct QuotePriceQuality enum values', () => {
      expect(QuotePriceQuality.FAST).toBe('fast')
      expect(QuotePriceQuality.OPTIMAL).toBe('optimal')
    })

    test('should have correct GetQuoteErrorType enum values', () => {
      expect(GetQuoteErrorType.SellAmountDoesNotCoverFee).toBe('SellAmountDoesNotCoverFee')
      expect(GetQuoteErrorType.NoLiquidity).toBe('NoLiquidity')
    })
  })

  describe('apiUrl', () => {
    test('should generate correct URLs for different environments and networks', () => {
      // Test Dev environment
      expect(apiUrl(Environment.Dev, 'mainnet')).toBe('https://barn.api.cow.fi/mainnet')
      expect(apiUrl(Environment.Dev, 'goerli')).toBe('https://barn.api.cow.fi/goerli')
      expect(apiUrl(Environment.Dev, 'sepolia')).toBe('https://barn.api.cow.fi/sepolia')

      // Test Prod environment
      expect(apiUrl(Environment.Prod, 'mainnet')).toBe('https://api.cow.fi/mainnet')
      expect(apiUrl(Environment.Prod, 'goerli')).toBe('https://api.cow.fi/goerli')
      expect(apiUrl(Environment.Prod, 'sepolia')).toBe('https://api.cow.fi/sepolia')
    })

    test('should throw error for invalid environment', () => {
      // @ts-expect-error: Testing invalid environment
      expect(() => apiUrl(999, 'mainnet')).toThrow('Invalid environment')
    })
  })

  describe('Api class construction', () => {
    test('should construct Api with string baseUrl consistently across adapters', () => {
      const baseUrl = 'https://custom.api.com'

      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Api = new Api('mainnet', baseUrl)

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Api = new Api('mainnet', baseUrl)

      setGlobalAdapter(adapters.viemAdapter)
      const viemApi = new Api('mainnet', baseUrl)

      // All should have the same properties
      expect(ethersV5Api.network).toBe('mainnet')
      expect(ethersV5Api.baseUrl).toBe(baseUrl)
      expect(ethersV6Api.network).toBe('mainnet')
      expect(ethersV6Api.baseUrl).toBe(baseUrl)
      expect(viemApi.network).toBe('mainnet')
      expect(viemApi.baseUrl).toBe(baseUrl)
    })

    test('should construct Api with Environment enum consistently across adapters', () => {
      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Api = new Api('mainnet', Environment.Prod)

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Api = new Api('mainnet', Environment.Prod)

      setGlobalAdapter(adapters.viemAdapter)
      const viemApi = new Api('mainnet', Environment.Prod)

      // All should have the same properties
      expect(ethersV5Api.network).toBe('mainnet')
      expect(ethersV5Api.baseUrl).toBe('https://api.cow.fi/mainnet')
      expect(ethersV6Api.network).toBe('mainnet')
      expect(ethersV6Api.baseUrl).toBe('https://api.cow.fi/mainnet')
      expect(viemApi.network).toBe('mainnet')
      expect(viemApi.baseUrl).toBe('https://api.cow.fi/mainnet')
    })
  })

  describe('estimateTradeAmount', () => {
    test('should estimate trade amount consistently across different adapters', async () => {
      const mockQuoteResponse = {
        quote: {
          ...testOrder,
          buyAmount: '2000000000000000000000', // 2000 DAI
        },
        from: TEST_ADDRESS,
        expiration: Math.floor(Date.now() / 1000) + 600,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockQuoteResponse),
      } as Response)

      const query: EstimateTradeAmountQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.SELL,
        amount: testOrder.sellAmount,
      }

      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Api = new Api('mainnet', Environment.Prod)
      const ethersV5Result = (await ethersV5Api.estimateTradeAmount(query)) as bigint

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Api = new Api('mainnet', Environment.Prod)
      const ethersV6Result = await ethersV6Api.estimateTradeAmount(query)

      setGlobalAdapter(adapters.viemAdapter)
      const viemApi = new Api('mainnet', Environment.Prod)
      const viemResult = await ethersV6Api.estimateTradeAmount(query)

      // Results should be consistent
      expect(String(ethersV5Result)).toBe(mockQuoteResponse.quote.buyAmount)
      expect(String(ethersV6Result)).toBe(mockQuoteResponse.quote.buyAmount)
      expect(String(viemResult)).toBe(mockQuoteResponse.quote.buyAmount)
    })

    test('should handle BUY orders correctly across adapters', async () => {
      const mockQuoteResponse = {
        quote: {
          ...testOrder,
          sellAmount: '1000000000000000000', // 1 WETH
        },
        from: TEST_ADDRESS,
        expiration: Math.floor(Date.now() / 1000) + 600,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockQuoteResponse),
      } as Response)

      const query: EstimateTradeAmountQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.BUY,
        amount: testOrder.buyAmount,
      }

      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Api = new Api('mainnet', Environment.Prod)
      const ethersV5Result = await ethersV5Api.estimateTradeAmount(query)

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Api = new Api('mainnet', Environment.Prod)
      const ethersV6Result = await ethersV6Api.estimateTradeAmount(query)

      setGlobalAdapter(adapters.viemAdapter)
      const viemApi = new Api('mainnet', Environment.Prod)
      const viemResult = await viemApi.estimateTradeAmount(query)

      // Results should be consistent
      expect(String(ethersV5Result)).toBe(mockQuoteResponse.quote.sellAmount)
      expect(String(ethersV6Result)).toBe(mockQuoteResponse.quote.sellAmount)
      expect(String(viemResult)).toBe(mockQuoteResponse.quote.sellAmount)
    })

    test('should throw error when quote token mismatch occurs', async () => {
      const mockQuoteResponse = {
        quote: {
          ...testOrder,
          buyToken: '0x1234567890123456789012345678901234567890', // Different token
        },
        from: TEST_ADDRESS,
        expiration: Math.floor(Date.now() / 1000) + 600,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockQuoteResponse),
      } as Response)

      const query: EstimateTradeAmountQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.SELL,
        amount: testOrder.sellAmount,
      }

      setGlobalAdapter(adapters.ethersV5Adapter)
      const api = new Api('mainnet', Environment.Prod)

      await expect(api.estimateTradeAmount(query)).rejects.toThrow(/incorrect quote token/i)
    })
  })

  describe('placeOrder', () => {
    test('should place order consistently across different adapters', async () => {
      const mockOrderId = 'order-123-abc'
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockOrderId),
      } as Response)

      const query: PlaceOrderQuery = {
        order: testOrder,
        signature: testSignature,
        from: TEST_ADDRESS,
      }

      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Api = new Api('mainnet', Environment.Prod)
      const ethersV5Result = await ethersV5Api.placeOrder(query)

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Api = new Api('mainnet', Environment.Prod)
      const ethersV6Result = await ethersV6Api.placeOrder(query)

      setGlobalAdapter(adapters.viemAdapter)
      const viemApi = new Api('mainnet', Environment.Prod)
      const viemResult = await viemApi.placeOrder(query)

      // Results should be consistent
      expect(ethersV5Result).toBe(mockOrderId)
      expect(ethersV6Result).toBe(mockOrderId)
      expect(viemResult).toBe(mockOrderId)

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledTimes(3)
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]!
      expect(lastCall[0]).toBe('https://api.cow.fi/mainnet/api/v1/orders')
      expect(lastCall[1]?.method).toBe('post')
      expect(lastCall[1]?.headers).toEqual({ 'Content-Type': 'application/json' })
    })

    test('should handle different signing schemes correctly', async () => {
      const mockOrderId = 'order-456-def'
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockOrderId),
      } as Response)

      setGlobalAdapter(adapters.ethersV5Adapter)
      const api = new Api('mainnet', Environment.Prod)

      // Test EIP712 signature
      const eip712Signature: ContractsEcdsaSignature = {
        scheme: SigningScheme.EIP712,
        data: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b',
      }

      let result = await api.placeOrder({
        order: testOrder,
        signature: eip712Signature,
        from: TEST_ADDRESS,
      })
      expect(result).toBe(mockOrderId)

      // Test ETHSIGN signature
      const ethsignSignature: ContractsEcdsaSignature = {
        scheme: SigningScheme.ETHSIGN,
        data: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b',
      }

      result = await api.placeOrder({
        order: testOrder,
        signature: ethsignSignature,
        from: TEST_ADDRESS,
      })
      expect(result).toBe(mockOrderId)

      // Test EIP1271 signature
      const eip1271Signature: Eip1271Signature = {
        scheme: SigningScheme.EIP1271,
        data: {
          verifier: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
          signature: '0x1234567890abcdef',
        } as Eip1271SignatureData,
      }

      result = await api.placeOrder({
        order: testOrder,
        signature: eip1271Signature,
        from: TEST_ADDRESS,
      })
      expect(result).toBe(mockOrderId)

      // Test PRESIGN signature
      const presignSignature: PreSignSignature = {
        scheme: SigningScheme.PRESIGN,
        data: TEST_ADDRESS,
      }

      result = await api.placeOrder({
        order: testOrder,
        signature: presignSignature,
        from: TEST_ADDRESS,
      })
      expect(result).toBe(mockOrderId)
    })
  })

  describe('getExecutedSellAmount', () => {
    test('should get executed sell amount consistently across different adapters', async () => {
      const mockResponse = {
        executedSellAmount: '500000000000000000', // 0.5 WETH
      }

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockResponse),
      } as Response)

      const query: GetExecutedSellAmountQuery = {
        uid: 'order-uid-123',
      }

      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Api = new Api('mainnet', Environment.Prod)
      const ethersV5Result = (await ethersV5Api.getExecutedSellAmount(query)) as bigint

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Api = new Api('mainnet', Environment.Prod)
      const ethersV6Result = (await ethersV6Api.getExecutedSellAmount(query)) as bigint

      setGlobalAdapter(adapters.viemAdapter)
      const viemApi = new Api('mainnet', Environment.Prod)
      const viemResult = (await viemApi.getExecutedSellAmount(query)) as bigint

      // Results should be consistent
      expect(ethersV5Result.toString()).toBe(mockResponse.executedSellAmount)
      expect(ethersV6Result.toString()).toBe(mockResponse.executedSellAmount)
      expect(viemResult.toString()).toBe(mockResponse.executedSellAmount)
    })
  })

  describe('getQuote', () => {
    test('should get quotes consistently across different adapters', async () => {
      const mockQuoteResponse = {
        quote: testOrder,
        from: TEST_ADDRESS,
        expiration: Math.floor(Date.now() / 1000) + 600,
        id: 12345,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockQuoteResponse),
      } as Response)

      const query: QuoteQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.SELL,
        sellAmountAfterFee: testOrder.sellAmount,
        from: TEST_ADDRESS,
        priceQuality: QuotePriceQuality.OPTIMAL,
      }

      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Api = new Api('mainnet', Environment.Prod)
      const ethersV5Result = await ethersV5Api.getQuote(query)

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Api = new Api('mainnet', Environment.Prod)
      const ethersV6Result = await ethersV6Api.getQuote(query)

      setGlobalAdapter(adapters.viemAdapter)
      const viemApi = new Api('mainnet', Environment.Prod)
      const viemResult = await viemApi.getQuote(query)

      // Results should be consistent
      expect(ethersV5Result).toEqual(mockQuoteResponse)
      expect(ethersV6Result).toEqual(mockQuoteResponse)
      expect(viemResult).toEqual(mockQuoteResponse)
    })

    test('should handle different quote types (sell before fee, sell after fee, buy)', async () => {
      const mockQuoteResponse = {
        quote: testOrder,
        from: TEST_ADDRESS,
        expiration: Math.floor(Date.now() / 1000) + 600,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockQuoteResponse),
      } as Response)

      setGlobalAdapter(adapters.ethersV5Adapter)
      const api = new Api('mainnet', Environment.Prod)

      // Test sell amount before fee
      const sellBeforeFeeQuery: QuoteQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.SELL,
        sellAmountBeforeFee: testOrder.sellAmount,
        from: TEST_ADDRESS,
      }

      // Test sell amount after fee
      const sellAfterFeeQuery: QuoteQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.SELL,
        sellAmountAfterFee: testOrder.sellAmount,
        from: TEST_ADDRESS,
      }

      // Test buy amount
      const buyQuery: QuoteQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.BUY,
        buyAmountAfterFee: testOrder.buyAmount,
        from: TEST_ADDRESS,
      }

      const result1 = await api.getQuote(sellBeforeFeeQuery)
      const result2 = await api.getQuote(sellAfterFeeQuery)
      const result3 = await api.getQuote(buyQuery)

      expect(result1).toEqual(mockQuoteResponse)
      expect(result2).toEqual(mockQuoteResponse)
      expect(result3).toEqual(mockQuoteResponse)
    })

    test('should handle optional parameters correctly', async () => {
      const mockQuoteResponse = {
        quote: testOrder,
        from: TEST_ADDRESS,
        expiration: Math.floor(Date.now() / 1000) + 600,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockQuoteResponse),
      } as Response)

      const queryWithOptionals: QuoteQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.SELL,
        sellAmountAfterFee: testOrder.sellAmount,
        from: TEST_ADDRESS,
        receiver: TEST_ADDRESS,
        validTo: testOrder.validTo,
        appData: testOrder.appData,
        partiallyFillable: true,
        sellTokenBalance: OrderBalance.EXTERNAL,
        buyTokenBalance: OrderBalance.INTERNAL,
        priceQuality: QuotePriceQuality.FAST,
      }

      setGlobalAdapter(adapters.ethersV5Adapter)
      const api = new Api('mainnet', Environment.Prod)
      const result = await api.getQuote(queryWithOptionals)

      expect(result).toEqual(mockQuoteResponse)
    })
  })

  describe('Error Handling', () => {
    test('should handle API errors consistently across adapters', async () => {
      const mockApiError = {
        errorType: GetQuoteErrorType.NoLiquidity,
        description: 'No liquidity available for this trade',
      }

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify(mockApiError),
      } as Response)

      const query: QuoteQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.SELL,
        sellAmountAfterFee: testOrder.sellAmount,
        from: TEST_ADDRESS,
      }

      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Api = new Api('mainnet', Environment.Prod)

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Api = new Api('mainnet', Environment.Prod)

      setGlobalAdapter(adapters.viemAdapter)
      const viemApi = new Api('mainnet', Environment.Prod)

      // All should throw similar errors
      await expect(ethersV5Api.getQuote(query)).rejects.toThrow()
      await expect(ethersV6Api.getQuote(query)).rejects.toThrow()
      await expect(viemApi.getQuote(query)).rejects.toThrow()

      // Test that the error contains API error information
      try {
        await ethersV5Api.getQuote(query)
      } catch (error: any) {
        expect(error.apiError).toEqual(mockApiError)
      }
    })

    test('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Not JSON',
      } as Response)

      const query: QuoteQuery = {
        sellToken: testOrder.sellToken,
        buyToken: testOrder.buyToken,
        kind: OrderKind.SELL,
        sellAmountAfterFee: testOrder.sellAmount,
        from: TEST_ADDRESS,
      }

      setGlobalAdapter(adapters.ethersV5Adapter)
      const api = new Api('mainnet', Environment.Prod)

      await expect(api.getQuote(query)).rejects.toThrow()
    })
  })

  describe('Network and Environment Combinations', () => {
    test('should work with different network and environment combinations', () => {
      const networks = ['mainnet', 'goerli', 'sepolia']
      const environments = [Environment.Dev, Environment.Prod]

      for (const network of networks) {
        for (const environment of environments) {
          setGlobalAdapter(adapters.ethersV5Adapter)
          const api = new Api(network, environment)

          expect(api.network).toBe(network)
          expect(api.baseUrl).toBe(apiUrl(environment, network))
        }
      }
    })
  })
})
