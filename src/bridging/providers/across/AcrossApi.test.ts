import { AcrossApi } from './AcrossApi'
import { AdditionalTargetChainId, SupportedChainId } from '../../../chains'

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
        text: () => Promise.resolve('Internal Server Error'),
      })

      await expect(
        api.getAvailableRoutes({
          originChainId: '1',
          originToken: '0x0000000000000000000000000000000000000001',
          destinationChainId: '137',
          destinationToken: '0x0000000000000000000000000000000000000002',
        })
      ).rejects.toThrow('HTTP error! Status: 400')
    })
  })

  describe('getSuggestedFees', () => {
    const mockResponse = {
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
      expectedFillTimeSec: '300',
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
      const request = {
        token: '0x0000000000000000000000000000000000000001',
        originChainId: SupportedChainId.MAINNET,
        destinationChainId: AdditionalTargetChainId.POLYGON,
        amount: '1000000000000000000',
      }

      const fees = await api.getSuggestedFees(request)

      expect(fees).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://app.across.to/api/suggested-fees?token=${request.token}&originChainId=${request.originChainId}&destinationChainId=${request.destinationChainId}&amount=${request.amount}`,
        expect.any(Object)
      )
    })

    it('should include recipient when provided', async () => {
      const request = {
        token: '0x0000000000000000000000000000000000000001',
        originChainId: SupportedChainId.MAINNET,
        destinationChainId: AdditionalTargetChainId.POLYGON,
        amount: '1000000000000000000',
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
        text: () => Promise.resolve('Internal Server Error'),
      })

      await expect(
        api.getSuggestedFees({
          token: '0x0000000000000000000000000000000000000001',
          originChainId: SupportedChainId.MAINNET,
          destinationChainId: AdditionalTargetChainId.POLYGON,
          amount: '1000000000000000000',
        })
      ).rejects.toThrow('HTTP error! Status: 500')
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
