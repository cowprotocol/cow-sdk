import { suggestSlippageBps } from './suggestSlippageBps'
import { suggestSlippageFromFee } from './suggestSlippageFromFee'
import { suggestSlippageFromVolume } from './suggestSlippageFromVolume'
import { QuoterParameters, TradeParameters } from './types'
import { OrderQuoteResponse } from '../order-book'
import { OrderKind, SellTokenSource, BuyTokenDestination } from '../order-book/generated'
import { getQuoteAmountsWithCosts } from '../order-book'
import { SupportedChainId } from '../chains'

// Mock the dependencies
jest.mock('./suggestSlippageFromFee')
jest.mock('./suggestSlippageFromVolume')
jest.mock('../order-book', () => ({
  ...jest.requireActual('../order-book'),
  getQuoteAmountsWithCosts: jest.fn(),
}))

const mockedSuggestSlippageFromFee = suggestSlippageFromFee as jest.MockedFunction<typeof suggestSlippageFromFee>
const mockedSuggestSlippageFromVolume = suggestSlippageFromVolume as jest.MockedFunction<
  typeof suggestSlippageFromVolume
>
const mockedGetQuoteAmountsWithCosts = getQuoteAmountsWithCosts as jest.MockedFunction<typeof getQuoteAmountsWithCosts>

describe('suggestSlippageBps', () => {
  const mockQuote: OrderQuoteResponse = {
    quote: {
      // Using 10K atoms as sell amount to make it easier to calculate from absolute slippage to percentage ones
      sellAmount: '10000', // 10K atoms
      feeAmount: '5', // 5 atoms
      sellToken: '0x...',
      buyToken: '0x...',
      buyAmount: '995',
      validTo: 1234567890,
      appData: '0x...',
      partiallyFillable: false,
      sellTokenBalance: SellTokenSource.ERC20,
      buyTokenBalance: BuyTokenDestination.ERC20,
      kind: OrderKind.SELL,
    },
    expiration: '2024-12-31T23:59:59Z',
    verified: true,
  }

  const mockTradeParameters: TradeParameters = {
    kind: OrderKind.SELL,
    sellToken: '0x...',
    buyToken: '0x...',
    sellTokenDecimals: 18,
    buyTokenDecimals: 18,
    amount: '10000',
  }

  const mockTrader: QuoterParameters = {
    chainId: SupportedChainId.MAINNET,
    account: '0x...',
    appCode: 'test',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock getQuoteAmountsWithCosts to return a fixed value
    mockedGetQuoteAmountsWithCosts.mockReturnValue({
      isSell: true,
      quotePrice: 1,
      sellAmountBeforeNetworkCosts: 10_000n,
      sellAmountAfterNetworkCosts: 9_995n,
      buyAmountBeforeNetworkCosts: 10_000n,
      buyAmountAfterNetworkCosts: 9_995n,
      networkCostAmount: 5n,
    })
  })

  describe('Normal flow', () => {
    it('should return a minimum of 50 bps', () => {
      // Mock the dependencies to return known values
      mockedSuggestSlippageFromFee.mockReturnValue(0n) // 0 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(0n) // 0 atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      })

      // Total should be 50 bps ==> MAX(0, 50)
      expect(result).toBe(50)
    })

    it('should add slippage from fee and volume', () => {
      // Mock the dependencies to return known values
      mockedSuggestSlippageFromFee.mockReturnValue(50n) // 50 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(30n) // 30 atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      })

      // Total should be 80 bps (50 + 30)
      expect(result).toBe(80)
    })

    it('should return volume slippage if slippage from fee is 0', () => {
      // Mock the dependencies to return known values
      mockedSuggestSlippageFromFee.mockReturnValue(0n) // 0 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(75n) // 75 atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      })

      // Total should be 75 bps (0 + 75)
      expect(result).toBe(75)
    })

    it('should return volume slippage if slippage from fee is 0', () => {
      // Mock the dependencies to return known values
      mockedSuggestSlippageFromFee.mockReturnValue(75n) // 75 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(0n) // 0 atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      })

      // Total should be 75 bps (0 + 75)
      expect(result).toBe(75)
    })

    it('should respect minimum slippage of 50 bps for non-eth-flow', () => {
      // Mock the dependencies to return very small values
      mockedSuggestSlippageFromFee.mockReturnValue(10n) // 10 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(20n) // 20 atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      })

      // Should be at least 50 bps
      expect(result).toBe(50)
    })

    it('should respect maximum slippage of 10000 bps (100%)', () => {
      // Mock the dependencies to return very large values
      mockedSuggestSlippageFromFee.mockReturnValue(6000n) // 6000 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(5000n) // 500 0atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      })

      // Should be capped at 10000 bps
      expect(result).toBe(10000)
    })
  })
  describe('Eth flow', () => {
    it('should respect minimum slippage of 200 bps for eth-flow on mainnet', () => {
      // Mock the dependencies to return very small values
      mockedSuggestSlippageFromFee.mockReturnValue(10n) // 10 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(20n) // 20 atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: { ...mockTrader, chainId: SupportedChainId.MAINNET }, // Mainnet
        isEthFlow: true,
      })

      // Should be at least 50 bps for eth flow on gnosis chain
      expect(result).toBe(200)
    })

    it('should respect minimum slippage of 50 bps for eth-flow on gnosis', () => {
      // Mock the dependencies to return very small values
      mockedSuggestSlippageFromFee.mockReturnValue(10n) // 10 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(20n) // 20 atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: { ...mockTrader, chainId: SupportedChainId.GNOSIS_CHAIN }, // Mainnet
        isEthFlow: true,
      })

      // Should be at least 50 bps for eth flow on gnosis chain
      expect(result).toBe(50)
    })

    it('should add slippage from fee and volume', () => {
      // Mock the dependencies to return known values
      mockedSuggestSlippageFromFee.mockReturnValue(50n) // 50 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(30n) // 30 atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: { ...mockTrader, chainId: SupportedChainId.GNOSIS_CHAIN },
        isEthFlow: true,
      })

      // Total should be 80 bps (50 + 30)
      expect(result).toBe(80)
    })

    it('should respect maximum slippage of 10000 bps (100%)', () => {
      // Mock the dependencies to return very large values
      mockedSuggestSlippageFromFee.mockReturnValue(6000n) // 6000 atoms from fee
      mockedSuggestSlippageFromVolume.mockReturnValue(5000n) // 5000 atoms from volume

      const result = suggestSlippageBps({
        quote: mockQuote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: true,
      })

      // Should be capped at 10000 bps
      expect(result).toBe(10000)
    })
  })
})
