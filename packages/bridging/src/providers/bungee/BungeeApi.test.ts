import { BungeeApi } from './BungeeApi'
import { BungeeBridge, BungeeQuote, BungeeQuoteAPIRequest, BungeeQuoteAPIResponse } from './types'
import { BridgeQuoteErrors } from '../../errors'
import {
  ACROSS_API_URL,
  BUNGEE_API_FALLBACK_TIMEOUT,
  BUNGEE_BASE_URL,
  BUNGEE_EVENTS_API_URL,
  DEFAULT_API_OPTIONS,
} from './consts'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

const mockQuoteResponse: BungeeQuoteAPIResponse = {
  success: true,
  statusCode: 200,
  result: {
    originChainId: 1,
    destinationChainId: 137,
    userAddress: '0x123',
    receiverAddress: '0x456',
    input: {
      token: {
        chainId: 1,
        address: '0x0000000000000000000000000000000000000001',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        logoURI: 'https://example.com/usdc.png',
        icon: 'usdc',
      },
      amount: '1000000',
      priceInUsd: 1,
      valueInUsd: 1000,
    },
    destinationExec: null,
    autoRoute: null,
    manualRoutes: [
      {
        quoteId: '123',
        quoteExpiry: 1234567890,
        output: {
          token: {
            chainId: 137,
            address: '0x0000000000000000000000000000000000000002',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoURI: 'https://example.com/usdc.png',
            icon: 'usdc',
          },
          amount: '990000',
          priceInUsd: 1,
          valueInUsd: 990,
          minAmountOut: '980000',
          effectiveReceivedInUsd: 980,
        },
        affiliateFee: null,
        approvalData: {
          spenderAddress: '0x0000000000000000000000000000000000000003',
          amount: '1000000',
          tokenAddress: '0x0000000000000000000000000000000000000001',
          userAddress: '0x123',
        },
        gasFee: {
          gasToken: {
            chainId: 1,
            address: '0x0000000000000000000000000000000000000004',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            icon: 'eth',
            logoURI: 'https://example.com/eth.png',
            chainAgnosticId: null,
          },
          gasLimit: '100000',
          gasPrice: '20000000000',
          estimatedFee: '0.001',
          feeInUsd: 2,
        },
        slippage: 0.5,
        estimatedTime: 300,
        routeDetails: {
          name: 'Across',
          logoURI: 'https://example.com/across.png',
          routeFee: {
            token: {
              chainId: 1,
              address: '0x0000000000000000000000000000000000000001',
              name: 'USD Coin',
              symbol: 'USDC',
              decimals: 6,
              logoURI: 'https://example.com/usdc.png',
              icon: 'usdc',
            },
            amount: '1000',
            feeInUsd: 1,
            priceInUsd: 1,
          },
          dexDetails: null,
        },
        refuel: null,
      },
    ],
  },
}

const mockQuoteRequest: BungeeQuoteAPIRequest = {
  originChainId: '1',
  destinationChainId: '137',
  inputToken: '0x0000000000000000000000000000000000000001',
  inputAmount: '1000000',
  userAddress: '0x123',
  receiverAddress: '0x456',
  outputToken: '0x0000000000000000000000000000000000000002',
  enableManual: true,
  disableSwapping: true,
  disableAuto: true,
}

describe('BungeeApi', () => {
  let api: BungeeApi

  beforeEach(() => {
    api = new BungeeApi()
    mockFetch.mockClear()
  })

  describe('getBungeeQuote', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuoteResponse),
      })
    })

    it('should fetch quote with required parameters', async () => {
      const request = mockQuoteRequest

      const quote = await api.getBungeeQuote(request)

      expect(quote).toBeDefined()
      expect(quote.originChainId).toBe(Number(request.originChainId))
      expect(quote.destinationChainId).toBe(Number(request.destinationChainId))
      expect(quote.userAddress).toBe(request.userAddress)
      expect(quote.receiverAddress).toBe(request.receiverAddress)
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/quote'), expect.any(Object))
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ text: 'Error message' }),
      })

      await expect(api.getBungeeQuote(mockQuoteRequest)).rejects.toThrow(BridgeQuoteErrors.API_ERROR)
    })
  })

  describe('getBungeeBuildTx', () => {
    const mockBuildTxResponse = {
      success: true,
      statusCode: 200,
      result: {
        approvalData: {
          spenderAddress: '0x0000000000000000000000000000000000000003',
          amount: '1000000',
          tokenAddress: '0x0000000000000000000000000000000000000001',
          userAddress: '0x123',
        },
        txData: {
          data: '0x123456',
          to: '0x0000000000000000000000000000000000000001',
          chainId: 1,
          value: '0',
        },
        userOp: '',
      },
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBuildTxResponse),
      })
    })

    it('should fetch build tx with quote', async () => {
      const mockQuote: BungeeQuote = {
        originChainId: 1,
        destinationChainId: 137,
        userAddress: '0x123',
        receiverAddress: '0x456',
        input: {
          token: {
            chainId: 1,
            address: '0x0000000000000000000000000000000000000001',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoURI: 'https://example.com/usdc.png',
            icon: 'usdc',
          },
          amount: '1000000',
          priceInUsd: 1,
          valueInUsd: 1000,
        },
        route: {
          quoteId: '123',
          quoteExpiry: 1234567890,
          output: {
            token: {
              chainId: 137,
              address: '0x0000000000000000000000000000000000000002',
              name: 'USD Coin',
              symbol: 'USDC',
              decimals: 6,
              logoURI: 'https://example.com/usdc.png',
              icon: 'usdc',
            },
            amount: '990000',
            priceInUsd: 1,
            valueInUsd: 990,
            minAmountOut: '980000',
            effectiveReceivedInUsd: 980,
          },
          affiliateFee: null,
          approvalData: {
            spenderAddress: '0x0000000000000000000000000000000000000003',
            amount: '1000000',
            tokenAddress: '0x0000000000000000000000000000000000000001',
            userAddress: '0x123',
          },
          gasFee: {
            gasToken: {
              chainId: 1,
              address: '0x0000000000000000000000000000000000000004',
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              icon: 'eth',
              logoURI: 'https://example.com/eth.png',
              chainAgnosticId: null,
            },
            gasLimit: '100000',
            gasPrice: '20000000000',
            estimatedFee: '0.001',
            feeInUsd: 2,
          },
          slippage: 0.5,
          estimatedTime: 300,
          routeDetails: {
            name: 'Across',
            logoURI: 'https://example.com/across.png',
            routeFee: {
              token: {
                chainId: 1,
                address: '0x0000000000000000000000000000000000000001',
                name: 'USD Coin',
                symbol: 'USDC',
                decimals: 6,
                logoURI: 'https://example.com/usdc.png',
                icon: 'usdc',
              },
              amount: '1000',
              feeInUsd: 1,
              priceInUsd: 1,
            },
            dexDetails: null,
          },
          refuel: null,
        },
        routeBridge: BungeeBridge.Across,
        quoteTimestamp: 1234567890,
      }

      const buildTx = await api.getBungeeBuildTx(mockQuote)

      expect(buildTx).toBeDefined()
      expect(buildTx.txData).toBeDefined()
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/build-tx'), expect.any(Object))
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ text: 'Error message' }),
      })

      const mockQuote: BungeeQuote = {
        originChainId: 1,
        destinationChainId: 137,
        userAddress: '0x123',
        receiverAddress: '0x456',
        input: {
          token: {
            chainId: 1,
            address: '0x0000000000000000000000000000000000000001',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoURI: 'https://example.com/usdc.png',
            icon: 'usdc',
          },
          amount: '1000000',
          priceInUsd: 1,
          valueInUsd: 1000,
        },
        route: {
          quoteId: '123',
          quoteExpiry: 1234567890,
          output: {
            token: {
              chainId: 137,
              address: '0x0000000000000000000000000000000000000002',
              name: 'USD Coin',
              symbol: 'USDC',
              decimals: 6,
              logoURI: 'https://example.com/usdc.png',
              icon: 'usdc',
            },
            amount: '990000',
            priceInUsd: 1,
            valueInUsd: 990,
            minAmountOut: '980000',
            effectiveReceivedInUsd: 980,
          },
          affiliateFee: null,
          approvalData: {
            spenderAddress: '0x0000000000000000000000000000000000000003',
            amount: '1000000',
            tokenAddress: '0x0000000000000000000000000000000000000001',
            userAddress: '0x123',
          },
          gasFee: {
            gasToken: {
              chainId: 1,
              address: '0x0000000000000000000000000000000000000004',
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              icon: 'eth',
              logoURI: 'https://example.com/eth.png',
              chainAgnosticId: null,
            },
            gasLimit: '100000',
            gasPrice: '20000000000',
            estimatedFee: '0.001',
            feeInUsd: 2,
          },
          slippage: 0.5,
          estimatedTime: 300,
          routeDetails: {
            name: 'Across',
            logoURI: 'https://example.com/across.png',
            routeFee: {
              token: {
                chainId: 1,
                address: '0x0000000000000000000000000000000000000001',
                name: 'USD Coin',
                symbol: 'USDC',
                decimals: 6,
                logoURI: 'https://example.com/usdc.png',
                icon: 'usdc',
              },
              amount: '1000',
              feeInUsd: 1,
              priceInUsd: 1,
            },
            dexDetails: null,
          },
          refuel: null,
        },
        routeBridge: BungeeBridge.Across,
        quoteTimestamp: 1234567890,
      }

      await expect(api.getBungeeBuildTx(mockQuote)).rejects.toThrow(BridgeQuoteErrors.API_ERROR)
    })
  })

  describe('getEvents', () => {
    const mockEventsResponse = {
      success: true,
      result: [
        {
          identifier: '123',
          srcTransactionHash: '0x123',
          bridgeName: 'across',
          fromChainId: 1,
          gasUsed: '100000',
          isCowswapTrade: true,
          isSocketTx: true,
          metadata: '',
          orderId: '123',
          recipient: '0x456',
          sender: '0x123',
          socketContractVersion: '1.0.0',
          srcAmount: '1000000',
          srcBlockHash: '0x789',
          srcBlockNumber: 12345678,
          srcBlockTimeStamp: 1234567890,
          srcTokenAddress: '0x0000000000000000000000000000000000000001',
          srcTokenDecimals: 6,
          srcTokenLogoURI: 'https://example.com/usdc.png',
          srcTokenName: 'USD Coin',
          srcTokenSymbol: 'USDC',
          to: '0x0000000000000000000000000000000000000002',
          toChainId: 137,
          destTransactionHash: '0x456',
          destAmount: '990000',
          destBlockHash: '0xabc',
          destBlockNumber: 12345679,
          destBlockTimeStamp: 1234567891,
          destTokenAddress: '0x0000000000000000000000000000000000000002',
          destTokenDecimals: 6,
          destTokenLogoURI: 'https://example.com/usdc.png',
          destTokenName: 'USD Coin',
          destTokenSymbol: 'USDC',
          srcTxStatus: 'COMPLETED',
          destTxStatus: 'COMPLETED',
        },
      ],
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEventsResponse),
      })
    })

    it('should fetch events with orderId', async () => {
      const events = await api.getEvents({ orderId: '123' })

      expect(events).toBeDefined()
      expect(events.length).toBe(1)
      expect(events[0]?.orderId).toBe('123')
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/order'), expect.any(Object))
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ text: 'Error message' }),
      })

      await expect(api.getEvents({ orderId: '123' })).rejects.toThrow(BridgeQuoteErrors.API_ERROR)
    })
  })

  describe('getAcrossStatus', () => {
    const mockAcrossStatusResponse = {
      status: 'filled',
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAcrossStatusResponse),
      })
    })

    it('should fetch across status with depositTxHash', async () => {
      const status = await api.getAcrossStatus('0x123')

      expect(status).toBe('filled')
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/deposit/status'), expect.any(Object))
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ text: 'Error message' }),
      })

      await expect(api.getAcrossStatus('0x123')).rejects.toThrow(BridgeQuoteErrors.API_ERROR)
    })
  })

  describe('custom API URL', () => {
    it('should use custom API URL when provided', async () => {
      const customUrl = 'https://custom-api.example.com'
      const customApi = new BungeeApi({ apiBaseUrl: customUrl })

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockQuoteResponse),
      })

      await customApi.getBungeeQuote(mockQuoteRequest)

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(customUrl), expect.any(Object))
    })
  })

  describe('fallback mechanism', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    describe('fallback configuration', () => {
      it('should use default fallback timeout (5 minutes) when not specified', () => {
        const api = new BungeeApi()
        // Access private property for testing
        expect((api as any).fallbackTimeoutMs).toBe(BUNGEE_API_FALLBACK_TIMEOUT) // 5 minutes
      })

      it('should use custom fallback timeout when specified', () => {
        const customTimeout = 600000 // 10 minutes
        const api = new BungeeApi({ fallbackTimeoutMs: customTimeout })
        expect((api as any).fallbackTimeoutMs).toBe(customTimeout)
      })
    })

    describe('infrastructure error fallback', () => {
      const customUrl = 'https://custom-api.example.com'
      let customApi: BungeeApi

      beforeEach(() => {
        customApi = new BungeeApi({ apiBaseUrl: customUrl })
      })

      it('should activate fallback on 500 server error and retry with default URL', async () => {
        let callCount = 0
        mockFetch.mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // First call to custom URL fails with 500
            return Promise.resolve({
              ok: false,
              status: 500,
              json: () => Promise.resolve({ error: 'Internal Server Error' }),
            })
          } else {
            // Second call to default URL succeeds
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockQuoteResponse),
            })
          }
        })

        const result = await customApi.getBungeeQuote(mockQuoteRequest)

        expect(result.route).toEqual(mockQuoteResponse.result.manualRoutes[0])
        expect(mockFetch).toHaveBeenCalledTimes(2)
        // First call should use custom URL
        expect(mockFetch).toHaveBeenNthCalledWith(1, expect.stringContaining(customUrl), expect.any(Object))
        // Second call should use default URL
        expect(mockFetch).toHaveBeenNthCalledWith(
          2,
          expect.stringContaining(DEFAULT_API_OPTIONS.apiBaseUrl),
          expect.any(Object),
        )
      })

      it('should activate fallback on 502 gateway error', async () => {
        let callCount = 0
        mockFetch.mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({
              ok: false,
              status: 502,
              json: () => Promise.resolve({ error: 'Bad Gateway' }),
            })
          } else {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockQuoteResponse),
            })
          }
        })

        const result = await customApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledTimes(2)
        expect(result.route).toEqual(mockQuoteResponse.result.manualRoutes[0])
      })

      it('should activate fallback on 429 rate limiting error', async () => {
        let callCount = 0
        mockFetch.mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({
              ok: false,
              status: 429,
              json: () => Promise.resolve({ error: 'Rate Limit Exceeded' }),
            })
          } else {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockQuoteResponse),
            })
          }
        })

        const result = await customApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledTimes(2)
        expect(result.route).toEqual(mockQuoteResponse.result.manualRoutes[0])
      })

      it('should not activate fallback on 4xx client errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Bad Request' }),
        })

        await expect(customApi.getBungeeQuote(mockQuoteRequest)).rejects.toThrow()

        // Should only be called once (no retry)
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(customUrl), expect.any(Object))
      })
    })

    describe('network error fallback', () => {
      const customUrl = 'https://custom-api.example.com'
      let customApi: BungeeApi

      beforeEach(() => {
        customApi = new BungeeApi({ apiBaseUrl: customUrl })
      })

      it('should activate fallback on network fetch error and retry with default URL', async () => {
        let callCount = 0
        mockFetch.mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // First call to custom URL fails with network error
            return Promise.reject(new TypeError('Failed to fetch'))
          } else {
            // Second call to default URL succeeds
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockQuoteResponse),
            })
          }
        })

        const result = await customApi.getBungeeQuote(mockQuoteRequest)

        expect(result).toBeDefined()
        expect(mockFetch).toHaveBeenCalledTimes(2)
        // First call should use custom URL
        expect(mockFetch).toHaveBeenNthCalledWith(1, expect.stringContaining(customUrl), expect.any(Object))
        // Second call should use default URL
        expect(mockFetch).toHaveBeenNthCalledWith(
          2,
          expect.stringContaining(DEFAULT_API_OPTIONS.apiBaseUrl),
          expect.any(Object),
        )
      })

      it('should activate fallback on connection timeout error', async () => {
        let callCount = 0
        mockFetch.mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.reject(new Error('fetch timeout'))
          } else {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockQuoteResponse),
            })
          }
        })

        await customApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledTimes(2)
      })
    })

    describe('fallback state management', () => {
      const customUrl = 'https://custom-api.example.com'
      let customApi: BungeeApi

      beforeEach(() => {
        customApi = new BungeeApi({
          apiBaseUrl: customUrl,
          fallbackTimeoutMs: 300000, // 5 minutes
        })
      })

      it('should use fallback URL immediately after activation', async () => {
        // First call activates fallback
        let callCount = 0
        mockFetch.mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: () => Promise.resolve({ error: 'Server Error' }),
            })
          } else {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockQuoteResponse),
            })
          }
        })

        await customApi.getBungeeQuote(mockQuoteRequest)

        mockFetch.mockClear()

        // Second call should immediately use fallback URL
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockQuoteResponse),
        })

        await customApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(DEFAULT_API_OPTIONS.apiBaseUrl),
          expect.any(Object),
        )
      })

      it('should expire fallback after timeout period', async () => {
        // Activate fallback
        let callCount = 0
        mockFetch.mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: () => Promise.resolve({ error: 'Server Error' }),
            })
          } else {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockQuoteResponse),
            })
          }
        })

        await customApi.getBungeeQuote(mockQuoteRequest)

        // Fast-forward time past fallback timeout
        jest.advanceTimersByTime(300001) // 5 minutes + 1ms

        mockFetch.mockClear()
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockQuoteResponse),
        })

        // Should now use custom URL again
        await customApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(customUrl), expect.any(Object))
      })
    })

    describe('retry behavior', () => {
      const customUrl = 'https://custom-api.example.com'
      let customApi: BungeeApi

      beforeEach(() => {
        customApi = new BungeeApi({ apiBaseUrl: customUrl })
      })

      it('should not retry more than once when fallback fails', async () => {
        // Both custom and fallback URLs fail
        mockFetch.mockImplementation((url: string) => {
          if (url.includes('custom-api')) {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: () => Promise.resolve({ error: 'Custom Server Error' }),
            })
          } else {
            return Promise.resolve({
              ok: false,
              status: 400,
              json: () => Promise.resolve({ error: 'Fallback Error' }),
            })
          }
        })

        await expect(customApi.getBungeeQuote(mockQuoteRequest)).rejects.toThrow()

        // Should be called exactly twice (original + one retry)
        expect(mockFetch).toHaveBeenCalledTimes(2)
      })

      it('should not retry when already using fallback URLs', async () => {
        // First activate fallback
        let callCount = 0
        mockFetch.mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: () => Promise.resolve({ error: 'Server Error' }),
            })
          } else {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockQuoteResponse),
            })
          }
        })

        await customApi.getBungeeQuote(mockQuoteRequest)

        mockFetch.mockClear()

        // Now fallback URL fails - should not retry again
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Fallback Server Error' }),
        })

        await expect(customApi.getBungeeQuote(mockQuoteRequest)).rejects.toThrow()

        // Should only be called once (no retry when already using fallback)
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('apiKey and customApiBaseUrl', () => {
    describe('when both apiKey and customApiBaseUrl are present', () => {
      const customApiBaseUrl = 'https://custom-bungee-api.example.com'
      const apiKey = 'test-api-key-123'
      let customApi: BungeeApi

      beforeEach(() => {
        customApi = new BungeeApi({
          apiKey,
          customApiBaseUrl,
        })
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockQuoteResponse),
        })
      })

      it('should use customApiBaseUrl for all API calls', async () => {
        await customApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(customApiBaseUrl),
          expect.objectContaining({
            headers: expect.objectContaining({
              'x-api-key': apiKey,
            }),
          }),
        )
      })
      it('should use customApiBaseUrl for build tx calls', async () => {
        const mockQuote: BungeeQuote = {
          originChainId: 1,
          destinationChainId: 137,
          userAddress: '0x123',
          receiverAddress: '0x456',
          input: mockQuoteResponse.result.input,
          route: mockQuoteResponse.result.manualRoutes[0] as any,
          routeBridge: BungeeBridge.Across,
          quoteTimestamp: 1234567890,
        }

        const mockBuildTxResponse = {
          success: true,
          statusCode: 200,
          result: {
            approvalData: {
              spenderAddress: '0x0000000000000000000000000000000000000003',
              amount: '1000000',
              tokenAddress: '0x0000000000000000000000000000000000000001',
              userAddress: '0x123',
            },
            txData: {
              data: '0x123456',
              to: '0x0000000000000000000000000000000000000001',
              chainId: 1,
              value: '0',
            },
            userOp: '',
          },
        }

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockBuildTxResponse),
        })

        await customApi.getBungeeBuildTx(mockQuote)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(customApiBaseUrl),
          expect.objectContaining({
            headers: expect.objectContaining({
              'x-api-key': apiKey,
            }),
          }),
        )
      })

      it('should not use customApiBaseUrl for events API calls', async () => {
        const mockEventsResponse = {
          success: true,
          result: [
            {
              identifier: '123',
              bridgeName: 'across',
              fromChainId: 1,
              isCowswapTrade: true,
              orderId: '123',
              sender: '0x123',
              srcTxStatus: 'COMPLETED',
              destTxStatus: 'COMPLETED',
            },
          ],
        }

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockEventsResponse),
        })

        await customApi.getEvents({ orderId: '123' })

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(BUNGEE_EVENTS_API_URL),
          expect.objectContaining({
            headers: expect.not.objectContaining({
              'x-api-key': apiKey,
            }),
          }),
        )
      })

      it('should not use customApiBaseUrl for across status API calls', async () => {
        const mockAcrossStatusResponse = {
          status: 'filled',
        }

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockAcrossStatusResponse),
        })

        await customApi.getAcrossStatus('0x123')

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(ACROSS_API_URL),
          expect.objectContaining({
            headers: expect.not.objectContaining({
              'x-api-key': apiKey,
            }),
          }),
        )
      })
    })

    describe('when only apiKey is present', () => {
      it('should use default URLs and not include api-key header', async () => {
        const apiOnlyApi = new BungeeApi({
          apiKey: 'test-api-key-123',
        })

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockQuoteResponse),
        })

        await apiOnlyApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(BUNGEE_BASE_URL),
          expect.objectContaining({
            headers: expect.not.objectContaining({
              'x-api-key': expect.any(String),
            }),
          }),
        )
      })
    })

    describe('when only customApiBaseUrl is present', () => {
      it('should use default URLs and not include api-key header', async () => {
        const urlOnlyApi = new BungeeApi({
          customApiBaseUrl: 'https://custom-bungee-api.example.com',
        })

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockQuoteResponse),
        })

        await urlOnlyApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(BUNGEE_BASE_URL),
          expect.objectContaining({
            headers: expect.not.objectContaining({
              'x-api-key': expect.any(String),
              affiliate: expect.anything(),
            }),
          }),
        )
      })
    })

    describe('when neither apiKey nor customApiBaseUrl are present', () => {
      it('should use default behavior', async () => {
        const defaultApi = new BungeeApi()

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockQuoteResponse),
        })

        await defaultApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(BUNGEE_BASE_URL),
          expect.objectContaining({
            headers: expect.not.objectContaining({
              'x-api-key': expect.any(String),
              affiliate: expect.anything(),
            }),
          }),
        )
      })
    })

    describe('affiliate header behavior with custom API', () => {
      it('should still include affiliate header when using custom API and affiliate is provided', async () => {
        const customApiBaseUrl = 'https://custom-bungee-api.example.com'
        const apiKey = 'test-api-key'

        const customApi = new BungeeApi({
          customApiBaseUrl,
          apiKey,
          affiliate: 'test-affiliate',
        })

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockQuoteResponse),
        })

        await customApi.getBungeeQuote(mockQuoteRequest)

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(customApiBaseUrl),
          expect.objectContaining({
            headers: expect.objectContaining({
              'x-api-key': apiKey,
              affiliate: 'test-affiliate',
            }),
          }),
        )
      })
    })
  })
})
