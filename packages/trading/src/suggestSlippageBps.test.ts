import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind, OrderQuoteResponse } from '@cowprotocol/sdk-order-book'

import { suggestSlippageBps, SuggestSlippageBps } from './suggestSlippageBps'
import { QuoterParameters, TradeParameters } from './types'
import { ETH_FLOW_DEFAULT_SLIPPAGE_BPS } from './consts'
import * as slippageUtils from './utils/slippage'

// `getQuoteAmountsAndCosts`, `getSlippagePercent`, `suggestSlippageFromFee`, `suggestSlippageFromVolume`
// and `percentageToBps` are all pure, deterministic functions with no I/O — they run for real in the
// "end-to-end" tests below, rather than being mocked, so a regression in `isSell` handling (which every
// one of them consumes) or in the bps unit conversion is actually caught.
//
// Note: an earlier version of this file mocked `@cowprotocol/sdk-order-book`'s `getQuoteAmountsWithCosts`,
// which does not exist anywhere in the codebase — the real export is `getQuoteAmountsAndCosts` — so that
// mock never connected to the code under test. It also mocked `percentageToBps` as `percent * 100`, where
// the real function is `percent * 10_000` (it treats its input as a portion of 1, not an already-scaled
// percentage). Both mocks are gone now; production behavior was unaffected by either defect.

const mockTradeParameters: Pick<TradeParameters, 'sellTokenDecimals' | 'buyTokenDecimals'> = {
  sellTokenDecimals: 18,
  buyTokenDecimals: 6,
}

const mockTrader: QuoterParameters = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  appCode: '0x007',
  account: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
}

function buildQuoteResponse(overrides: Partial<OrderQuoteResponse['quote']>): OrderQuoteResponse {
  return {
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
      kind: OrderKind.SELL,
      partiallyFillable: false,
      sellTokenBalance: 'erc20',
      buyTokenBalance: 'erc20',
      signingScheme: 'eip712',
      ...overrides,
    },
    from: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
    expiration: '2024-11-08T09:21:35.442772888Z',
    id: 486289,
    verified: true,
  } as OrderQuoteResponse
}

describe('suggestSlippageBps', () => {
  describe('real end-to-end computation (unmocked)', () => {
    // SELL order: sellAmount is what the API returns AFTER network costs (per getQuoteAmountsAndCosts'
    // own docstring), so sellAmountBeforeNetworkCosts (101e18) and sellAmountAfterNetworkCosts (100e18)
    // genuinely differ, exercising the same `isSell` branch a mutated/inverted flag would silently skip.
    //
    // Hand-verified: slippageBpsFromFee = applyPercentage(1e18, 50%) = 0.5e18
    //                slippageBpsFromVolume = applyPercentage(100e18, 0.5%) = 0.5e18
    //                totalSlippageBps = 1e18
    //                slippagePercent = 1 - (100e18 - 1e18)/100e18 = 0.01 (1%)
    //                slippageBps = percentageToBps(0.01) = 100
    it('computes the real slippage for a SELL order', () => {
      const quote = buildQuoteResponse({
        kind: OrderKind.SELL,
        sellAmount: '100000000000000000000', // 100e18, API value = after network costs
        buyAmount: '50000000', // 50e6
        feeAmount: '1000000000000000000', // 1e18
      })

      const params: SuggestSlippageBps = {
        quote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      expect(suggestSlippageBps(params)).toBe(100)
    })

    // BUY order: sellAmount is what the API returns AFTER protocol fee only (per the same docstring),
    // so sellAmountBeforeNetworkCosts (50e18) and sellAmountAfterNetworkCosts (51e18) differ the other
    // way around from the SELL case — this is the branch that previously had zero test coverage at all,
    // since `isSell` was fully mocked out in every existing test.
    //
    // Hand-verified: slippageBpsFromFee = applyPercentage(1e18, 50%) = 0.5e18
    //                slippageBpsFromVolume = applyPercentage(50e18, 0.5%) = 0.25e18
    //                totalSlippageBps = 0.75e18
    //                slippagePercent = (50e18 + 0.75e18)/50e18 - 1 = 0.015 (1.5%)
    //                slippageBps = percentageToBps(0.015) = 150
    it('computes the real slippage for a BUY order', () => {
      const quote = buildQuoteResponse({
        kind: OrderKind.BUY,
        sellAmount: '50000000000000000000', // 50e18, API value = before network costs
        buyAmount: '100000000', // 100e6
        feeAmount: '1000000000000000000', // 1e18
      })

      const params: SuggestSlippageBps = {
        quote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      expect(suggestSlippageBps(params)).toBe(150)
    })

    it('a mutated/inverted isSell would break both of the above assertions', () => {
      // This test exists purely to document the property the two tests above are relying on: SELL and
      // BUY produce different results (100 vs 150) precisely because they exercise different branches
      // of `isSell` throughout the real call chain. If a future change collapses that distinction, this
      // assertion is what documents the intent, on top of the two independently hand-verified expected
      // values above.
      const sellQuote = buildQuoteResponse({
        kind: OrderKind.SELL,
        sellAmount: '100000000000000000000',
        buyAmount: '50000000',
        feeAmount: '1000000000000000000',
      })
      const buyQuote = buildQuoteResponse({
        kind: OrderKind.BUY,
        sellAmount: '50000000000000000000',
        buyAmount: '100000000',
        feeAmount: '1000000000000000000',
      })

      const sellResult = suggestSlippageBps({
        quote: sellQuote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      })
      const buyResult = suggestSlippageBps({
        quote: buyQuote,
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      })

      expect(sellResult).not.toBe(buyResult)
    })
  })

  describe('Lower bound clamping', () => {
    // These tests mock `getSlippagePercent` directly to isolate the clamp logic (Math.max/Math.min) from
    // the amount computation above — that isolation is legitimate here, unlike the previous version of
    // this file, which mocked it to bypass real computation for every test including the ones meant to
    // exercise it. `getSlippagePercent`'s real contract returns "a percentage as a portion of 1" (see its
    // own docstring), so the mocked values below follow that convention, and expected results are derived
    // using the REAL `percentageToBps` (which multiplies by 10_000, not 100).
    let getSlippagePercentSpy: jest.SpyInstance

    beforeEach(() => {
      getSlippagePercentSpy = jest.spyOn(slippageUtils, 'getSlippagePercent')
    })

    afterEach(() => {
      getSlippagePercentSpy.mockRestore()
    })

    it('Should clamp to 0 for non-EthFlow orders when calculated slippage is negative', () => {
      getSlippagePercentSpy.mockReturnValue(-0.01) // -1%, not reachable via real inputs but defended against

      const params: SuggestSlippageBps = {
        quote: buildQuoteResponse({}),
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      expect(suggestSlippageBps(params)).toBe(0)
    })

    it('Should clamp to ETH_FLOW_DEFAULT_SLIPPAGE_BPS for EthFlow orders when calculated slippage is below default', () => {
      getSlippagePercentSpy.mockReturnValue(0.0001) // 0.01%, well below the EthFlow default floor

      const params: SuggestSlippageBps = {
        quote: buildQuoteResponse({}),
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: true,
      }

      expect(suggestSlippageBps(params)).toBe(ETH_FLOW_DEFAULT_SLIPPAGE_BPS[SupportedChainId.GNOSIS_CHAIN])
    })

    it('Should not clamp for non-EthFlow orders when calculated slippage is above 0', () => {
      getSlippagePercentSpy.mockReturnValue(0.01) // 1% = 100 BPS via the real percentageToBps

      const params: SuggestSlippageBps = {
        quote: buildQuoteResponse({}),
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      expect(suggestSlippageBps(params)).toBe(100)
    })

    it('Should not clamp for EthFlow orders when calculated slippage is above default', () => {
      getSlippagePercentSpy.mockReturnValue(0.02) // 2% = 200 BPS

      const params: SuggestSlippageBps = {
        quote: buildQuoteResponse({}),
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: true,
      }

      expect(suggestSlippageBps(params)).toBe(200)
    })
  })

  describe('Upper bound clamping', () => {
    let getSlippagePercentSpy: jest.SpyInstance

    beforeEach(() => {
      getSlippagePercentSpy = jest.spyOn(slippageUtils, 'getSlippagePercent')
    })

    afterEach(() => {
      getSlippagePercentSpy.mockRestore()
    })

    it('Should clamp to MAX_SLIPPAGE_BPS (10000) when calculated slippage exceeds 100%', () => {
      getSlippagePercentSpy.mockReturnValue(1.5) // 150% = 15000 BPS

      const params: SuggestSlippageBps = {
        quote: buildQuoteResponse({}),
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      expect(suggestSlippageBps(params)).toBe(10000)
    })

    it('Should clamp to MAX_SLIPPAGE_BPS (10000) for EthFlow orders when calculated slippage exceeds 100%', () => {
      getSlippagePercentSpy.mockReturnValue(2) // 200% = 20000 BPS

      const params: SuggestSlippageBps = {
        quote: buildQuoteResponse({}),
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: true,
      }

      expect(suggestSlippageBps(params)).toBe(10000)
    })

    it('Should not clamp when calculated slippage is exactly at MAX_SLIPPAGE_BPS', () => {
      getSlippagePercentSpy.mockReturnValue(1) // 100% = 10000 BPS

      const params: SuggestSlippageBps = {
        quote: buildQuoteResponse({}),
        tradeParameters: mockTradeParameters,
        trader: mockTrader,
        isEthFlow: false,
      }

      expect(suggestSlippageBps(params)).toBe(10000)
    })
  })
})
