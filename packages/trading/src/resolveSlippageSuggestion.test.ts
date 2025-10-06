import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind, OrderQuoteResponse, PriceQuality } from '@cowprotocol/sdk-order-book'
import { resolveSlippageSuggestion } from './resolveSlippageSuggestion'
import { QuoterParameters, SwapAdvancedSettings, TradeParameters } from './types'

jest.mock('./suggestSlippageBps', () => ({
  suggestSlippageBps: jest.fn(),
}))

jest.mock('./utils/getPartnerFeeBps', () => ({
  getPartnerFeeBps: jest.fn().mockReturnValue(0),
}))

const { suggestSlippageBps } = jest.requireMock('./suggestSlippageBps')

const mockQuoteResponse: OrderQuoteResponse = {
  quote: {
    sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
    receiver: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
    sellAmount: '98115217044683860',
    buyAmount: '984440000000',
    validTo: 1731059375,
    appData: '{"appCode":"CoW Swap"}',
    appDataHash: '0x05fb36aed7ba01f92544e72888fb354cdeab68b6bbb0b9ea5e64edc364093b42',
    feeAmount: '1884782955316140',
    kind: 'sell',
    partiallyFillable: false,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
    signingScheme: 'eip712',
  },
  from: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
  expiration: '2024-11-08T09:21:35.442772888Z',
  id: 486289,
  verified: true,
} as OrderQuoteResponse

const mockTradeParameters: TradeParameters = {
  kind: OrderKind.SELL,
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '100000000000000000',
  slippageBps: 50,
}

const mockTrader: QuoterParameters = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  appCode: '0x007',
  account: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
}

describe('resolveSlippageSuggestion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    suggestSlippageBps.mockReturnValue(100)
  })

  describe('When priceQuality defaults to OPTIMAL', () => {
    it('Should call getSlippageSuggestion when priceQuality is undefined (defaults to OPTIMAL)', async () => {
      const mockGetSlippageSuggestion = jest.fn().mockResolvedValue({ slippageBps: 200 })
      const advancedSettings: SwapAdvancedSettings = {
        getSlippageSuggestion: mockGetSlippageSuggestion,
      }

      const result = await resolveSlippageSuggestion(
        SupportedChainId.GNOSIS_CHAIN,
        mockTradeParameters,
        mockTrader,
        mockQuoteResponse,
        false,
        advancedSettings,
      )

      expect(result).toEqual({ slippageBps: 200 })
      expect(mockGetSlippageSuggestion).toHaveBeenCalled()
      expect(suggestSlippageBps).toHaveBeenCalledWith({
        isEthFlow: false,
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        advancedSettings,
      })
    })
  })

  describe('When priceQuality is FAST', () => {
    it('Should return default suggestion without calling getSlippageSuggestion', async () => {
      const mockGetSlippageSuggestion = jest.fn().mockResolvedValue({ slippageBps: 200 })
      const advancedSettings: SwapAdvancedSettings = {
        quoteRequest: { priceQuality: PriceQuality.FAST },
        getSlippageSuggestion: mockGetSlippageSuggestion,
      }

      const result = await resolveSlippageSuggestion(
        SupportedChainId.GNOSIS_CHAIN,
        mockTradeParameters,
        mockTrader,
        mockQuoteResponse,
        false,
        advancedSettings,
      )

      expect(result).toEqual({ slippageBps: 100 })
      expect(mockGetSlippageSuggestion).not.toHaveBeenCalled()
      expect(suggestSlippageBps).toHaveBeenCalledWith({
        isEthFlow: false,
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        advancedSettings,
      })
    })
  })

  describe('When getSlippageSuggestion is not provided', () => {
    it('Should return default suggestion', async () => {
      const result = await resolveSlippageSuggestion(
        SupportedChainId.GNOSIS_CHAIN,
        mockTradeParameters,
        mockTrader,
        mockQuoteResponse,
        false,
      )

      expect(result).toEqual({ slippageBps: 100 })
      expect(suggestSlippageBps).toHaveBeenCalled()
    })
  })

  describe('When priceQuality is OPTIMAL and getSlippageSuggestion is provided', () => {
    it('Should call getSlippageSuggestion with correct parameters', async () => {
      const mockGetSlippageSuggestion = jest.fn().mockResolvedValue({ slippageBps: 200 })
      const advancedSettings: SwapAdvancedSettings = {
        quoteRequest: { priceQuality: PriceQuality.OPTIMAL },
        getSlippageSuggestion: mockGetSlippageSuggestion,
      }

      const result = await resolveSlippageSuggestion(
        SupportedChainId.GNOSIS_CHAIN,
        mockTradeParameters,
        mockTrader,
        mockQuoteResponse,
        false,
        advancedSettings,
      )

      expect(result).toEqual({ slippageBps: 200 })
      expect(mockGetSlippageSuggestion).toHaveBeenCalledWith({
        chainId: SupportedChainId.GNOSIS_CHAIN,
        sellToken: mockTradeParameters.sellToken,
        buyToken: mockTradeParameters.buyToken,
        sellAmount: expect.any(BigInt),
        buyAmount: expect.any(BigInt),
      })
      expect(suggestSlippageBps).toHaveBeenCalled()
    })

    it('Should pass amounts after partner fees to getSlippageSuggestion', async () => {
      const mockGetSlippageSuggestion = jest.fn().mockResolvedValue({ slippageBps: 200 })
      const tradeParamsWithPartnerFee: TradeParameters = {
        ...mockTradeParameters,
        partnerFee: {
          volumeBps: 50,
          recipient: '0x1234567890123456789012345678901234567890',
        },
      }
      const advancedSettings: SwapAdvancedSettings = {
        quoteRequest: { priceQuality: PriceQuality.OPTIMAL },
        getSlippageSuggestion: mockGetSlippageSuggestion,
      }

      await resolveSlippageSuggestion(
        SupportedChainId.GNOSIS_CHAIN,
        tradeParamsWithPartnerFee,
        mockTrader,
        mockQuoteResponse,
        false,
        advancedSettings,
      )

      const callArgs = mockGetSlippageSuggestion.mock.calls[0][0]
      expect(callArgs.sellAmount).toBeDefined()
      expect(callArgs.buyAmount).toBeDefined()
    })
  })

  describe('When priceQuality is OPTIMAL and getSlippageSuggestion is provided', () => {
    it('Should return max between defaultSuggestion and suggestedSlippage when suggested is higher', async () => {
      suggestSlippageBps.mockReturnValue(50)
      const mockGetSlippageSuggestion = jest.fn().mockResolvedValue({ slippageBps: 200 })
      const advancedSettings: SwapAdvancedSettings = {
        quoteRequest: { priceQuality: PriceQuality.OPTIMAL },
        getSlippageSuggestion: mockGetSlippageSuggestion,
      }

      const result = await resolveSlippageSuggestion(
        SupportedChainId.GNOSIS_CHAIN,
        mockTradeParameters,
        mockTrader,
        mockQuoteResponse,
        false,
        advancedSettings,
      )

      expect(result).toEqual({ slippageBps: 200 })
    })

    it('Should return max between defaultSuggestion and suggestedSlippage when default is higher', async () => {
      suggestSlippageBps.mockReturnValue(300)
      const mockGetSlippageSuggestion = jest.fn().mockResolvedValue({ slippageBps: 100 })
      const advancedSettings: SwapAdvancedSettings = {
        quoteRequest: { priceQuality: PriceQuality.OPTIMAL },
        getSlippageSuggestion: mockGetSlippageSuggestion,
      }

      const result = await resolveSlippageSuggestion(
        SupportedChainId.GNOSIS_CHAIN,
        mockTradeParameters,
        mockTrader,
        mockQuoteResponse,
        false,
        advancedSettings,
      )

      expect(result).toEqual({ slippageBps: 300 })
    })
  })

  describe('EthFlow orders', () => {
    it('Should pass isEthFlow flag to suggestSlippageBps', async () => {
      await resolveSlippageSuggestion(
        SupportedChainId.GNOSIS_CHAIN,
        mockTradeParameters,
        mockTrader,
        mockQuoteResponse,
        true,
      )

      expect(suggestSlippageBps).toHaveBeenCalledWith({
        isEthFlow: true,
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        advancedSettings: undefined,
      })
    })
  })
})
