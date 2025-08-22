import { TradingSdk } from './tradingSdk'
import { SupportedChainId } from '../chains'
import { TradeBaseParameters } from './types'
import { OrderBookApi, OrderKind } from '../order-book'
import { AppDataParams } from '@cowprotocol/app-data'

const defaultOrderParams: TradeBaseParameters = {
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '100000000000000000',
  kind: OrderKind.SELL,
}

const quoteResponseMock = {
  quote: {
    sellToken: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    buyToken: '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59',
    receiver: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
    sellAmount: '1005456782512030400',
    buyAmount: '400000000000000000000',
    validTo: 1737468944,
    appData:
      '{"appCode":"test","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":50}},"version":"1.3.0"}',
    appDataHash: '0xe269b09f45b1d3c98d8e4e841b99a0779fbd3b77943d069b91ddc4fd9789e27e',
    feeAmount: '1112955650440102',
    kind: 'buy',
    partiallyFillable: false,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
    signingScheme: 'eip712',
  },
  from: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
  expiration: '2025-01-21T14:07:44.176194885Z',
  id: 575498,
  verified: true,
}

const defaultTrader = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  appCode: 'test',
  signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
}

describe('TradingSdk', () => {
  let orderBookApi: OrderBookApi

  beforeEach(() => {
    orderBookApi = {
      context: {
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
      getQuote: jest.fn().mockResolvedValue(quoteResponseMock),
      sendOrder: jest.fn().mockResolvedValue('0x01'),
    } as unknown as OrderBookApi
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Logs', () => {
    it('When logs option is set to false, then should not display logs', async () => {
      const logSpy = jest.spyOn(console, 'log')

      const sdk = new TradingSdk(defaultTrader, { enableLogging: false, orderBookApi })

      await sdk.getQuote(defaultOrderParams)

      expect(logSpy.mock.calls.length).toBe(0)
    })

    it('When logs option is set to true, then should display logs', async () => {
      const logSpy = jest.spyOn(console, 'log')

      const sdk = new TradingSdk(defaultTrader, { enableLogging: true, orderBookApi })

      await sdk.getQuote(defaultOrderParams)

      expect(logSpy.mock.calls[0][0]).toContain('[COW TRADING SDK]')
    })
  })

  describe('Quote and post limit order', () => {
    it('Aave postLimitOrder vs postSwapOrderFromQuote test', async () => {
      const slippageBips = 30
      const partnerFeeBps = 15

      const sdk = new TradingSdk(defaultTrader, { orderBookApi })

      const quote = await sdk.getQuote(defaultOrderParams)

      const appDataParams: AppDataParams = {
        metadata: {
          quote: {
            slippageBips,
          },
          partnerFee: {
            volumeBps: partnerFeeBps,
            recipient: '0xrecipient',
          },
        },
      }

      // Before fix - postLimitOrder and {quote: undefined}
      await sdk.postLimitOrder(
        {
          ...quote.quoteResults.tradeParameters,
          ...quote.quoteResults.orderToSign,
          slippageBps: slippageBips,
          buyAmount: quote.quoteResults.amountsAndCosts.afterNetworkCosts.buyAmount.toString(),
        },
        {
          appData: {
            ...appDataParams,
            metadata: { ...appDataParams.metadata, quote: undefined }, // quote.slippageBips is undefined, which is wrong
          },
        },
      )

      // Partial fix - {quote: { slippageBips }}
      await sdk.postLimitOrder(
        {
          ...quote.quoteResults.tradeParameters,
          ...quote.quoteResults.orderToSign,
          // buyAmount is manually defined (you don't need to do that with postSwapOrderFromQuote())
          buyAmount: quote.quoteResults.amountsAndCosts.afterNetworkCosts.buyAmount.toString(),
        },
        {
          appData: appDataParams, // quote.slippageBips is defined, which is correct
        },
      )

      // Full fix - postSwapOrderFromQuote and {quote: { slippageBips }}
      //
      await quote.postSwapOrderFromQuote({
        appData: appDataParams, // quote.slippageBips is defined, which is correct
      })

      const beforeFixCall = (orderBookApi.sendOrder as jest.Mock).mock.calls[0][0]
      const withSlippageFixCall = (orderBookApi.sendOrder as jest.Mock).mock.calls[1][0]
      const fullFixCall = (orderBookApi.sendOrder as jest.Mock).mock.calls[2][0]

      // Sell amount are the same
      expect(beforeFixCall.sellAmount).toBe('1006569738162470502')
      expect(withSlippageFixCall.sellAmount).toBe('1006569738162470502')
      expect(fullFixCall.sellAmount).toBe('1006569738162470502')

      /**
       * Corresponding to `quoteResponseMock` and mocked values:
       * * buyAmount = 400000000000000000000
       *  slippageBips = 30
       *  partnerFeeBps = 15
       *
       * AfterPartnerFees should be: 400000000000000000000 - (400000000000000000000 * 0.15 / 100) = 399400000000000000000
       * AfterSlippage should be: 399400000000000000000 - (399400000000000000000 * 0.3 / 100) = 398201800000000000000
       */
      expect(beforeFixCall.buyAmount).toBe('398201800000000000000') // correct
      expect(withSlippageFixCall.buyAmount).toBe('398201800000000000000') // correct
      expect(fullFixCall.buyAmount).toBe('398201800000000000000') // correct
    })
  })
})
