import { SupportedEvmChainId } from '@cowprotocol/sdk-config'
import { OrderQuoteResponse } from '@cowprotocol/sdk-order-book'

import { suggestSlippageBps, SuggestSlippageBps } from './suggestSlippageBps'
import { QuoterParameters, TradeParameters } from './types'
import { ETH_FLOW_DEFAULT_SLIPPAGE_BPS } from './consts'

jest.mock('@cowprotocol/sdk-common', () => ({
  percentageToBps: jest.fn((percent) => Math.round(percent * 100)),
}))

jest.mock('@cowprotocol/sdk-order-book', () => ({
  ...jest.requireActual('@cowprotocol/sdk-order-book'),
  getQuoteAmountsWithCosts: jest.fn(),
}))

jest.mock('./utils/slippage', () => ({
  getSlippagePercent: jest.fn(),
}))

jest.mock('./suggestSlippageFromFee', () => ({
  suggestSlippageFromFee: jest.fn(),
}))

jest.mock('./suggestSlippageFromVolume', () => ({
  suggestSlippageFromVolume: jest.fn(),
}))

const { getQuoteAmountsWithCosts } = jest.requireMock('@cowprotocol/sdk-order-book')
const { getSlippagePercent } = jest.requireMock('./utils/slippage')
const { suggestSlippageFromFee } = jest.requireMock('./suggestSlippageFromFee')
const { suggestSlippageFromVolume } = jest.requireMock('./suggestSlippageFromVolume')

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

const mockTradeParameters: Pick<TradeParameters, 'sellTokenDecimals' | 'buyTokenDecimals'> = {
  sellTokenDecimals: 18,
  buyTokenDecimals: 18,
}

const mockTrader: QuoterParameters = {
  chainId: SupportedEvmChainId.GNOSIS_CHAIN,
  appCode: '0x007',
  account: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
}

describe('suggestSlippageBps', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getQuoteAmountsWithCosts.mockReturnValue({
      isSell: true,
      sellAmountBeforeNetworkCosts: BigInt('100000000000000000'),
      sellAmountAfterNetworkCosts: BigInt('98115217044683860'),
    })

    suggestSlippageFromFee.mockReturnValue(10)
    suggestSlippageFromVolume.mockReturnValue(5)
  })

  describe('Lower bound clamping', () => {
    it('Should clamp to 0 for non-EthFlow orders when calculated slippage is negative', () => {
      getSlippagePercent.mockReturnValue(-1)

      const params: SuggestSlippageBps = {
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      const result = suggestSlippageBps(params)

      expect(result).toBe(0)
    })

    it('Should clamp to ETH_FLOW_DEFAULT_SLIPPAGE_BPS for EthFlow orders when calculated slippage is below default', () => {
      getSlippagePercent.mockReturnValue(0.01) // Very low slippage, results in 1 BPS

      const params: SuggestSlippageBps = {
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: true,
      }

      const result = suggestSlippageBps(params)

      expect(result).toBe(ETH_FLOW_DEFAULT_SLIPPAGE_BPS[SupportedEvmChainId.GNOSIS_CHAIN])
    })

    it('Should not clamp for non-EthFlow orders when calculated slippage is above 0', () => {
      getSlippagePercent.mockReturnValue(1) // 1% = 100 BPS

      const params: SuggestSlippageBps = {
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      const result = suggestSlippageBps(params)

      expect(result).toBe(100)
    })

    it('Should not clamp for EthFlow orders when calculated slippage is above default', () => {
      getSlippagePercent.mockReturnValue(2) // 2% = 200 BPS

      const params: SuggestSlippageBps = {
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: true,
      }

      const result = suggestSlippageBps(params)

      expect(result).toBe(200)
    })
  })

  describe('Upper bound clamping', () => {
    it('Should clamp to MAX_SLIPPAGE_BPS (10000) when calculated slippage exceeds 100%', () => {
      getSlippagePercent.mockReturnValue(150) // 150% = 15000 BPS

      const params: SuggestSlippageBps = {
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      const result = suggestSlippageBps(params)

      expect(result).toBe(10000)
    })

    it('Should clamp to MAX_SLIPPAGE_BPS (10000) for EthFlow orders when calculated slippage exceeds 100%', () => {
      getSlippagePercent.mockReturnValue(200) // 200% = 20000 BPS

      const params: SuggestSlippageBps = {
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: true,
      }

      const result = suggestSlippageBps(params)

      expect(result).toBe(10000)
    })

    it('Should not clamp when calculated slippage is exactly at MAX_SLIPPAGE_BPS', () => {
      getSlippagePercent.mockReturnValue(100) // 100% = 10000 BPS

      const params: SuggestSlippageBps = {
        quote: mockQuoteResponse,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      const result = suggestSlippageBps(params)

      expect(result).toBe(10000)
    })
  })
})
