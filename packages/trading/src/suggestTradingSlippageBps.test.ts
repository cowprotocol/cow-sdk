import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind, OrderQuoteResponse } from '@cowprotocol/sdk-order-book'

import { suggestTradingSlippageBps } from './suggestTradingSlippageBps'

// Keep this suite separate from the adapter's mocked delegation tests to exercise the shared math too.
describe('suggestTradingSlippageBps with real quote amounts and slippage math', () => {
  it.each([
    { kind: OrderKind.SELL, sellAmount: '100000000000000000000', expectedBps: 100 },
    { kind: OrderKind.BUY, sellAmount: '50000000000000000000', expectedBps: 150 },
  ])('computes $expectedBps BPS for a $kind quote', ({ kind, sellAmount, expectedBps }) => {
    const quote: OrderQuoteResponse = {
      quote: {
        sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
        buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
        receiver: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
        sellAmount,
        buyAmount: '100000000',
        validTo: 1731059375,
        appData: '{"appCode":"CoW Swap"}',
        appDataHash: '0x05fb36aed7ba01f92544e72888fb354cdeab68b6bbb0b9ea5e64edc364093b42',
        feeAmount: '1000000000000000000',
        kind,
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

    // 50% of the fee plus 0.5% of volume: SELL (0.5 + 0.5) / 100, BUY (0.5 + 0.25) / 50.
    expect(
      suggestTradingSlippageBps({
        quote,
        tradeParameters: { sellTokenDecimals: 18, buyTokenDecimals: 6 },
        trader: {
          chainId: SupportedChainId.GNOSIS_CHAIN,
          appCode: '0x007',
          account: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
        },
        isEthFlow: false,
      }),
    ).toBe(expectedBps)
  })
})
