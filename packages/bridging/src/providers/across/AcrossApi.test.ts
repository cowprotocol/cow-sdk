import { AcrossApi } from './AcrossApi'
import { type SwapApprovalApiResponse } from './swapApprovalMapper'
import {
  DepositStatusRequest,
  DepositStatusResponse,
  SuggestedFeesRequest,
  SuggestedFeesResponse,
  SwapApprovalRequest,
} from './types'
import { BridgeQuoteErrors } from '../../errors'
import { SupportedChainId } from '@cowprotocol/sdk-config'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

const TOKEN_A = { chainId: SupportedChainId.POLYGON, address: '0x123', decimals: 18, symbol: 'TOKEN1', name: 'Token 1' }
const TOKEN_B = { chainId: SupportedChainId.POLYGON, address: '0x456', decimals: 6, symbol: 'TOKEN2', name: 'Token 2' }

function padWord(n: bigint): string {
  return n.toString(16).padStart(64, '0')
}

function buildSwapApprovalFixture(): SwapApprovalApiResponse {
  const quoteTs = 1700000000
  const fillDl = quoteTs + 100
  const relAddr = '1111111111111111111111111111111111111111'
  const w7 = `${'0'.repeat(24)}${relAddr}`
  const body =
    [1n, 2n, 3n, 4n, 5n, 6n, 7n].map(padWord).join('') +
    w7 +
    padWord(BigInt(quoteTs)) +
    padWord(BigInt(fillDl)) +
    padWord(0n)
  const data = `0x110560ad${body}`

  return {
    id: 'test-quote-id',
    inputAmount: '1000000000000000000',
    expectedOutputAmount: '300010000000',
    inputToken: TOKEN_A,
    outputToken: TOKEN_B,
    expectedFillTime: 300,
    quoteExpiryTimestamp: fillDl,
    swapTx: {
      data,
      to: '0xabcd1234abcd1234abcd1234abcd1234abcd1234',
      chainId: SupportedChainId.MAINNET,
    },
    steps: {
      bridge: {
        outputAmount: '300010000000',
        fees: {
          pct: '100000000000000',
          amount: '100000',
          details: {
            type: 'across',
            relayerCapital: { pct: '50000000000000', amount: '50000' },
            destinationGas: { pct: '50000000000000', amount: '50000' },
            lp: { pct: '30000000000000', amount: '30000' },
          },
        },
      },
    },
  }
}

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
        originChainId: 1,
        originToken: '0x0000000000000000000000000000000000000001',
        destinationChainId: 137,
        destinationToken: '0x0000000000000000000000000000000000000002',
      }

      const routes = await api.getAvailableRoutes(params)

      expect(routes).toEqual(mockRoutes)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://app.across.to/api/available-routes?originChainId=1&originToken=0x0000000000000000000000000000000000000001&destinationChainId=137&destinationToken=0x0000000000000000000000000000000000000002',
        expect.any(Object),
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
          originChainId: 1,
          originToken: '0x0000000000000000000000000000000000000001',
          destinationChainId: 137,
          destinationToken: '0x0000000000000000000000000000000000000002',
        }),
      ).rejects.toThrow(BridgeQuoteErrors.API_ERROR)
    })
  })

  describe('getSuggestedFees', () => {
    const mockResponse: SuggestedFeesResponse = {
      id: '1',
      inputToken: TOKEN_A,
      outputToken: TOKEN_B,
      outputAmount: '300010000000',
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
        inputToken: '0x0000000000000000000000000000000000000001',
        outputToken: '0x0000000000000000000000000000000000000002',
        originChainId: SupportedChainId.MAINNET,
        destinationChainId: SupportedChainId.POLYGON,
        amount: 1000000000000000000n,
      }

      const fees = await api.getSuggestedFees(request)

      expect(fees).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://app.across.to/api/suggested-fees?inputToken=${request.inputToken}&outputToken=${request.outputToken}&originChainId=${request.originChainId}&destinationChainId=${request.destinationChainId}&amount=${request.amount}&allowUnmatchedDecimals=true`,
        expect.any(Object),
      )
    })

    it('should include recipient when provided', async () => {
      const request: SuggestedFeesRequest = {
        inputToken: '0x0000000000000000000000000000000000000001',
        outputToken: '0x0000000000000000000000000000000000000002',
        originChainId: SupportedChainId.MAINNET,
        destinationChainId: SupportedChainId.POLYGON,
        amount: 1000000000000000000n,
        recipient: '0x9876',
      }

      await api.getSuggestedFees(request)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`recipient=${request.recipient}`),
        expect.any(Object),
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
          inputToken: '0x0000000000000000000000000000000000000001',
          outputToken: '0x0000000000000000000000000000000000000002',
          originChainId: SupportedChainId.MAINNET,
          destinationChainId: SupportedChainId.POLYGON,
          amount: 1000000000000000000n,
        }),
      ).rejects.toThrow(BridgeQuoteErrors.API_ERROR)
    })
  })

  describe('getSwapApproval', () => {
    const swapFixture = buildSwapApprovalFixture()

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(swapFixture),
      })
    })

    it('should fetch swap approval JSON', async () => {
      const depositor = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      const request: SwapApprovalRequest = {
        inputToken: '0x0000000000000000000000000000000000000001',
        outputToken: '0x0000000000000000000000000000000000000002',
        originChainId: SupportedChainId.MAINNET,
        destinationChainId: SupportedChainId.POLYGON,
        amount: 1000000000000000000n,
        depositor,
      }

      const result = await api.getSwapApproval(request)

      expect(result).toEqual(swapFixture)
      const calledUrl = mockFetch.mock.calls[0][0] as string
      const parsed = new URL(calledUrl)
      expect(parsed.pathname).toBe('/api/swap/approval')
      expect(parsed.searchParams.get('tradeType')).toBe('exactInput')
      expect(parsed.searchParams.get('depositor')).toBe(depositor)
      expect(parsed.searchParams.get('slippage')).toBe('auto')
    })

    it('should include recipient when provided', async () => {
      const request: SwapApprovalRequest = {
        inputToken: '0x0000000000000000000000000000000000000001',
        outputToken: '0x0000000000000000000000000000000000000002',
        originChainId: SupportedChainId.MAINNET,
        destinationChainId: SupportedChainId.POLYGON,
        amount: 1000000000000000000n,
        depositor: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        recipient: '0x9876',
      }

      await api.getSwapApproval(request)

      const calledUrl = mockFetch.mock.calls[0][0] as string
      expect(calledUrl).toContain(`recipient=${request.recipient}`)
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ text: 'Internal Server Error' }),
      })

      await expect(
        api.getSwapApproval({
          inputToken: '0x0000000000000000000000000000000000000001',
          outputToken: '0x0000000000000000000000000000000000000002',
          originChainId: SupportedChainId.MAINNET,
          destinationChainId: SupportedChainId.POLYGON,
          amount: 1000000000000000000n,
          depositor: '0xcccccccccccccccccccccccccccccccccccccccc',
        }),
      ).rejects.toThrow(BridgeQuoteErrors.API_ERROR)
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
        originChainId: 1,
        originToken: '0x0000000000000000000000000000000000000001',
        destinationChainId: 137,
        destinationToken: '0x0000000000000000000000000000000000000002',
      })

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(customUrl), expect.any(Object))
    })
  })

  describe('getDepositStatus', () => {
    const mockResponse: DepositStatusResponse = {
      status: 'filled',
      fillTx: '0x1234567890',
      destinationChainId: '137',
      originChainId: '1',
      depositId: '',
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    })

    it('should fetch deposit status with required parameters', async () => {
      const request: DepositStatusRequest = {
        originChainId: '1',
        depositId: '1234567890',
      }

      const status = await api.getDepositStatus(request)

      expect(status).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://app.across.to/api/deposit/status?originChainId=${request.originChainId}&depositId=${request.depositId}`,
        expect.any(Object),
      )
    })

    it('should return an error if the deposit status is not found', async () => {
      const mockNotFoundResponse = {
        error: 'DepositNotFoundException',
        message: 'Deposit not found given the provided constraints',
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockNotFoundResponse),
      })

      const request: DepositStatusRequest = {
        originChainId: '8453',
        depositId: '66666666',
      }

      const status = await api.getDepositStatus(request)

      expect(status).toEqual(mockNotFoundResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        `https://app.across.to/api/deposit/status?originChainId=${request.originChainId}&depositId=${request.depositId}`,
        expect.any(Object),
      )
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ text: 'Internal Server Error' }),
      })

      await expect(
        api.getDepositStatus({
          originChainId: '1',
          depositId: '1234567890',
        }),
      ).rejects.toThrow(BridgeQuoteErrors.API_ERROR)
    })
  })
})
