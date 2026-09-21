import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderQuoteResponse } from '@cowprotocol/sdk-order-book'

import { suggestTradingSlippageBps, SuggestSlippageBps } from './suggestTradingSlippageBps'
import { QuoterParameters, TradeParameters } from './types'
import { ETH_FLOW_DEFAULT_SLIPPAGE_BPS } from './consts'

jest.mock('@cowprotocol/sdk-common', () => ({
  ...jest.requireActual('@cowprotocol/sdk-common'),
  suggestSlippageBps: jest.fn(),
}))

const { suggestSlippageBps: suggestSlippageBpsCore } = jest.requireMock('@cowprotocol/sdk-common')

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
  chainId: SupportedChainId.GNOSIS_CHAIN,
  appCode: '0x007',
  account: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
}

describe('suggestSlippageBps', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    suggestSlippageBpsCore.mockReturnValue(123)
  })

  it('extracts amounts from the quote and delegates the math to the shared core function', () => {
    const params: SuggestSlippageBps = {
      quote: mockQuoteResponse,
      tradeParameters: mockTradeParameters,
      trader: mockTrader,
      isEthFlow: false,
      volumeMultiplierPercent: 0.75,
    }

    const result = suggestTradingSlippageBps(params)

    // sellAmount=98115217044683860, feeAmount=1884782955316140 -> before = sell+fee, after = sell (sell order)
    expect(suggestSlippageBpsCore).toHaveBeenCalledWith({
      isSell: true,
      feeAmount: 1884782955316140n,
      sellAmountBeforeNetworkCosts: 98115217044683860n + 1884782955316140n,
      sellAmountAfterNetworkCosts: 98115217044683860n,
      lowerCapBps: 0,
      volumeMultiplierPercent: 0.75,
    })
    expect(result).toBe(123)
  })

  it('passes no lower cap for a non-eth-flow order', () => {
    suggestTradingSlippageBps({
      quote: mockQuoteResponse,
      tradeParameters: mockTradeParameters,
      trader: mockTrader,
      isEthFlow: false,
    })

    expect(suggestSlippageBpsCore).toHaveBeenCalledWith(expect.objectContaining({ lowerCapBps: 0 }))
  })

  it("passes the chain's eth-flow default as the lower cap for an eth-flow order", () => {
    suggestTradingSlippageBps({
      quote: mockQuoteResponse,
      tradeParameters: mockTradeParameters,
      trader: mockTrader,
      isEthFlow: true,
    })

    expect(suggestSlippageBpsCore).toHaveBeenCalledWith(
      expect.objectContaining({ lowerCapBps: ETH_FLOW_DEFAULT_SLIPPAGE_BPS[SupportedChainId.GNOSIS_CHAIN] }),
    )
  })

  it('uses the trader chainId to resolve the eth-flow lower cap', () => {
    suggestTradingSlippageBps({
      quote: mockQuoteResponse,
      tradeParameters: mockTradeParameters,
      trader: { ...mockTrader, chainId: SupportedChainId.MAINNET },
      isEthFlow: true,
    })

    expect(suggestSlippageBpsCore).toHaveBeenCalledWith(
      expect.objectContaining({ lowerCapBps: ETH_FLOW_DEFAULT_SLIPPAGE_BPS[SupportedChainId.MAINNET] }),
    )
  })
})
