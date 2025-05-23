import { AcrossApi } from './AcrossApi'
import { SupportedChainId } from '../../../chains'
import { SuggestedFeesRequest, SuggestedFeesResponse } from './types'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('AcrossApi', () => {
  let api: AcrossApi

  beforeEach(() => {
    api = new AcrossApi()
    mockFetch.mockClear()
  })

  describe('getAvailableRoutes', () => {
    const mockRoutes = [
      {
        originChainId: '1',
        originToken: '0x0000000000000000000000000000000000000001',
        destinationChainId: '137',
        destinationToken: '0x0000000000000000000000000000000000000002',
        originTokenSymbol: 'USDC',
        destinationTokenSymbol: 'USDC',
      },
    ]

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRoutes),
      })
    })

    it('should fetch available routes with all parameters', async () => {
      const params = {
        originChainId: '1',
        originToken: '0x0000000000000000000000000000000000000001',
        destinationChainId: '137',
        destinationToken: '0x0000000000000000000000000000000000000002',
      }

      const routes = await api.getAvailableRoutes(params)

      expect(routes).toEqual(mockRoutes)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://app.across.to/api/available-routes?originChainId=1&originToken=0x0000000000000000000000000000000000000001&destinationChainId=137&destinationToken=0x0000000000000000000000000000000000000002',
        expect.any(Object)
      )
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ text: 'Error message' }),
      })

      await expect(
        api.getAvailableRoutes({
          originChainId: '1',
          originToken: '0x0000000000000000000000000000000000000001',
          destinationChainId: '137',
          destinationToken: '0x0000000000000000000000000000000000000002',
        })
      ).rejects.toThrow('Across Api Error')
    })
  })

  describe('getSuggestedFees', () => {
    const mockResponse: SuggestedFeesResponse = {
      totalRelayFee: { pct: '100000000000000', total: '100000' },
      relayerCapitalFee: { pct: '50000000000000', total: '50000' },
      relayerGasFee: { pct: '50000000000000', total: '50000' },
      lpFee: { pct: '30000000000000', total: '30000' },
      timestamp: '1234567890',
      isAmountTooLow: false,
      quoteBlock: '12345',
      spokePoolAddress: '0xabcd',
      exclusiveRelayer: '0x0000000000000000000000000000000000000001',
      exclusivityDeadline: '0',
      estimatedFillTimeSec: '300',
      fillDeadline: '1234567890',
      limits: {
        minDeposit: '1000000',
        maxDeposit: '1000000000000',
        maxDepositInstant: '100000000',
        maxDepositShortDelay: '500000000',
        recommendedDepositInstant: '50000000',
      },
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    })

    it('should fetch suggested fees with required parameters', async () => {
      const request: SuggestedFeesRequest = {
        token: '0x0000000000000000000000000000000000000001',
        originChainId: SupportedChainId.MAINNET,
        destinationChainId: SupportedChainId.POLYGON,
        amount: 1000000000000000000n,
      }

      const fees = await api.getSuggestedFees(request)

      expect(fees).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://app.across.to/api/suggested-fees?token=${request.token}&originChainId=${request.originChainId}&destinationChainId=${request.destinationChainId}&amount=${request.amount}`,
        expect.any(Object)
      )
    })

    it('should include recipient when provided', async () => {
      const request: SuggestedFeesRequest = {
        token: '0x0000000000000000000000000000000000000001',
        originChainId: SupportedChainId.MAINNET,
        destinationChainId: SupportedChainId.POLYGON,
        amount: 1000000000000000000n,
        recipient: '0x9876',
      }

      await api.getSuggestedFees(request)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`recipient=${request.recipient}`),
        expect.any(Object)
      )
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ text: 'Internal Server Error' }),
      })

      await expect(
        api.getSuggestedFees({
          token: '0x0000000000000000000000000000000000000001',
          originChainId: SupportedChainId.MAINNET,
          destinationChainId: SupportedChainId.POLYGON,
          amount: 1000000000000000000n,
        })
      ).rejects.toThrow('Across Api Error')
    })
  })

  describe('custom API URL', () => {
    it('should use custom API URL when provided', async () => {
      const customUrl = 'https://custom-api.example.com'
      const customApi = new AcrossApi({ apiBaseUrl: customUrl })

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await customApi.getAvailableRoutes({
        originChainId: '1',
        originToken: '0x0000000000000000000000000000000000000001',
        destinationChainId: '137',
        destinationToken: '0x0000000000000000000000000000000000000002',
      })

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(customUrl), expect.any(Object))
    })
  })
})
