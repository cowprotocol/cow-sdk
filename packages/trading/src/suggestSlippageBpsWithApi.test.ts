import { suggestSlippageBpsWithApi } from './suggestSlippageBpsWithApi'
import { suggestSlippageBps } from './suggestSlippageBps'
import { CoWBFFClient } from './cowBffClient'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind, OrderQuoteResponse } from '@cowprotocol/sdk-order-book'

// Mock the dependencies
jest.mock('./suggestSlippageBps')
jest.mock('./cowBffClient')

const mockSuggestSlippageBps = suggestSlippageBps as jest.MockedFunction<typeof suggestSlippageBps>
const MockCoWBFFClient = CoWBFFClient as jest.MockedClass<typeof CoWBFFClient>

const mockQuote: OrderQuoteResponse = {
  quote: {
    sellToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    buyToken: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    receiver: '0x123',
    sellAmount: '1000000000000000000',
    buyAmount: '100000000',
    validTo: 1234567890,
    appData: '{}',
    appDataHash: '0x123',
    feeAmount: '1000000000000000',
    kind: 'sell',
    partiallyFillable: false,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
    signingScheme: 'eip712',
  },
  from: '0x123',
  expiration: '2024-01-01T00:00:00Z',
  id: 1,
  verified: true,
} as OrderQuoteResponse

const baseParams = {
  quote: mockQuote,
  tradeParameters: {
    sellToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    buyToken: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    sellTokenDecimals: 18,
    buyTokenDecimals: 8,
    kind: OrderKind.SELL,
    amount: '1000000000000000000',
  },
  trader: {
    chainId: SupportedChainId.MAINNET,
    appCode: '0x007',
    account: '0x123' as const,
  },
  isEthFlow: false,
  bffOrigin: 'http://slippage.api',
}

describe('suggestSlippageBpsWithApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSuggestSlippageBps.mockReturnValue(100) // Default fallback value
  })

  it('should use API slippage when API call succeeds', async () => {
    const mockApiClient = {
      getSlippageTolerance: jest.fn().mockResolvedValue({ slippageBps: 250 }),
    }
    MockCoWBFFClient.mockImplementation(() => mockApiClient as any)

    const result = await suggestSlippageBpsWithApi(baseParams)

    expect(MockCoWBFFClient).toHaveBeenCalledWith('http://slippage.api')
    expect(mockApiClient.getSlippageTolerance).toHaveBeenCalledWith({
      sellToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
      buyToken: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      chainId: SupportedChainId.MAINNET,
    })
    expect(result).toBe(250)
    expect(mockSuggestSlippageBps).not.toHaveBeenCalled()
  })

  it('should fallback to calculation when API returns null', async () => {
    const mockApiClient = {
      getSlippageTolerance: jest.fn().mockResolvedValue(null),
    }
    MockCoWBFFClient.mockImplementation(() => mockApiClient as any)

    const result = await suggestSlippageBpsWithApi(baseParams)

    expect(mockSuggestSlippageBps).toHaveBeenCalledWith(baseParams)
    expect(result).toBe(100)
  })

  it('should fallback to calculation when API throws error', async () => {
    const mockApiClient = {
      getSlippageTolerance: jest.fn().mockRejectedValue(new Error('API error')),
    }
    MockCoWBFFClient.mockImplementation(() => mockApiClient as any)

    const result = await suggestSlippageBpsWithApi(baseParams)

    expect(mockSuggestSlippageBps).toHaveBeenCalledWith(baseParams)
    expect(result).toBe(100)
  })

  it('should fallback when API slippage is too low (below minimum)', async () => {
    const mockApiClient = {
      getSlippageTolerance: jest.fn().mockResolvedValue({ slippageBps: -1 }), // Below default minimum of 0
    }
    MockCoWBFFClient.mockImplementation(() => mockApiClient as any)

    const result = await suggestSlippageBpsWithApi(baseParams)

    expect(mockSuggestSlippageBps).toHaveBeenCalledWith(baseParams)
    expect(result).toBe(100)
  })

  it('should fallback when API slippage is too high (above maximum)', async () => {
    const mockApiClient = {
      getSlippageTolerance: jest.fn().mockResolvedValue({ slippageBps: 15000 }), // Above max of 10000
    }
    MockCoWBFFClient.mockImplementation(() => mockApiClient as any)

    const result = await suggestSlippageBpsWithApi(baseParams)

    expect(mockSuggestSlippageBps).toHaveBeenCalledWith(baseParams)
    expect(result).toBe(100)
  })

  it('should handle EthFlow orders correctly', async () => {
    const mockApiClient = {
      getSlippageTolerance: jest.fn().mockResolvedValue({ slippageBps: 300 }),
    }
    MockCoWBFFClient.mockImplementation(() => mockApiClient as any)

    const ethFlowParams = {
      ...baseParams,
      isEthFlow: true,
    }

    const result = await suggestSlippageBpsWithApi(ethFlowParams)

    expect(result).toBe(300)
    expect(mockApiClient.getSlippageTolerance).toHaveBeenCalledWith({
      sellToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
      buyToken: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      chainId: SupportedChainId.MAINNET,
    })
  })

  it('should validate API response has correct structure', async () => {
    const mockApiClient = {
      getSlippageTolerance: jest.fn().mockResolvedValue({ slippageBps: 'invalid' }), // Invalid type
    }
    MockCoWBFFClient.mockImplementation(() => mockApiClient as any)

    const result = await suggestSlippageBpsWithApi(baseParams)

    expect(mockSuggestSlippageBps).toHaveBeenCalledWith(baseParams)
    expect(result).toBe(100)
  })

  it('should handle different chain IDs correctly', async () => {
    const mockApiClient = {
      getSlippageTolerance: jest.fn().mockResolvedValue({ slippageBps: 180 }),
    }
    MockCoWBFFClient.mockImplementation(() => mockApiClient as any)

    const gnosisParams = {
      ...baseParams,
      trader: {
        ...baseParams.trader,
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
    }

    const result = await suggestSlippageBpsWithApi(gnosisParams)

    expect(mockApiClient.getSlippageTolerance).toHaveBeenCalledWith({
      sellToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
      buyToken: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      chainId: SupportedChainId.GNOSIS_CHAIN,
    })
    expect(result).toBe(180)
  })

  it('should pass custom timeout to API client', async () => {
    const mockApiClient = {
      getSlippageTolerance: jest.fn().mockResolvedValue({ slippageBps: 200 }),
    }
    MockCoWBFFClient.mockImplementation(() => mockApiClient as any)

    const customTimeoutParams = {
      ...baseParams,
      slippageApiTimeoutMs: 5000,
    }

    await suggestSlippageBpsWithApi(customTimeoutParams)

    expect(mockApiClient.getSlippageTolerance).toHaveBeenCalledWith({
      sellToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
      buyToken: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      chainId: SupportedChainId.MAINNET,
      timeoutMs: 5000,
    })
  })
})
