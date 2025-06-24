import { BungeeApi } from './BungeeApi'
import { BungeeQuote, BungeeQuoteAPIRequest, BungeeBridge, BungeeQuoteAPIResponse } from './types'
import { BridgeQuoteErrors } from '../../errors'

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
      const request: BungeeQuoteAPIRequest = {
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

      await expect(
        api.getBungeeQuote({
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
        }),
      ).rejects.toThrow(BridgeQuoteErrors.API_ERROR)
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
      expect(events[0].orderId).toBe('123')
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

      await customApi.getBungeeQuote({
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
      })

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(customUrl), expect.any(Object))
    })
  })
})
