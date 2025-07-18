import { getQuoteWithSigner } from './getQuote'
import { SwapParameters } from './types'
import { ETH_ADDRESS, WRAPPED_NATIVE_CURRENCIES } from '../common'
import { SupportedChainId } from '../chains'
import { OrderBookApi, OrderKind, OrderQuoteResponse } from '../order-book'

const quoteResponseMock = {
  quote: {
    sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
    receiver: '0xfb3c7eb936caa12b5a884d612393969a557d4307',
    sellAmount: '98115217044683860',
    buyAmount: '984440000000',
    validTo: 1731059375,
    appData:
      '{"appCode":"CoW Swap","environment":"production","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":50,"smartSlippage":false}},"version":"1.3.0"}',
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

const defaultOrderParams: SwapParameters = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  signer: '1bb337bafb276f779c3035874b8914e4b851bb989dbb34e776397076576f3804',
  appCode: '0x007',
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '100000000000000000',
  kind: OrderKind.SELL,
  slippageBps: 50,
}

const getQuoteMock = jest.fn()
const orderBookApiMock = {
  getQuote: getQuoteMock,
} as unknown as OrderBookApi

describe('getQuoteToSign', () => {
  beforeEach(() => {
    getQuoteMock.mockReset()
    getQuoteMock.mockResolvedValue(quoteResponseMock)
  })

  describe('App data', () => {
    it('Should add slippageBps and appCode from parameters', async () => {
      const { result } = await getQuoteWithSigner({ ...defaultOrderParams, slippageBps: 76 }, {}, orderBookApiMock)
      const appData = JSON.parse(result.appDataInfo.fullAppData)

      expect(appData.metadata.quote.slippageBips).toBe(76)
      expect(appData.appCode).toBe(defaultOrderParams.appCode)
    })

    it('Should add advanced appData parameters', async () => {
      const { result } = await getQuoteWithSigner(
        defaultOrderParams,
        {
          appData: {
            environment: 'barn',
          },
        },
        orderBookApiMock,
      )

      const appData = JSON.parse(result.appDataInfo.fullAppData)

      expect(appData.environment).toBe('barn')
    })
  })

  describe('Quote request', () => {
    describe('When sell ETH', () => {
      it('Then should override sell token with wrapped one', async () => {
        await getQuoteWithSigner(
          { ...defaultOrderParams, sellToken: ETH_ADDRESS, slippageBps: undefined },
          {},
          orderBookApiMock,
        )

        const call = getQuoteMock.mock.calls[0][0]

        expect(call.sellToken).toBe(WRAPPED_NATIVE_CURRENCIES[defaultOrderParams.chainId].address)
      })

      it('Default slippage should be 2% in mainnet', async () => {
        await getQuoteWithSigner(
          { ...defaultOrderParams, chainId: SupportedChainId.MAINNET, sellToken: ETH_ADDRESS, slippageBps: undefined },
          {},
          orderBookApiMock,
        )

        const call = getQuoteMock.mock.calls[0][0]
        const appData = JSON.parse(call.appData)

        expect(appData.metadata.quote.slippageBips).toBe(200)
      })
    })

    it('Should add appData to the request', async () => {
      await getQuoteWithSigner(defaultOrderParams, {}, orderBookApiMock)

      const call = getQuoteMock.mock.calls[0][0]
      const appData = JSON.parse(call.appData)

      expect(appData.appCode).toBe(defaultOrderParams.appCode)
      expect(appData.metadata.quote.slippageBips).toBe(defaultOrderParams.slippageBps)
    })

    it('priceQuality must always be OPTIMAL', async () => {
      await getQuoteWithSigner(defaultOrderParams, {}, orderBookApiMock)

      const call = getQuoteMock.mock.calls[0][0]

      expect(call.priceQuality).toBe('optimal')
    })

    it('When is sell order, then should set sellAmountBeforeFee', async () => {
      await getQuoteWithSigner({ ...defaultOrderParams, kind: OrderKind.SELL }, {}, orderBookApiMock)

      const call = getQuoteMock.mock.calls[0][0]

      expect(call.sellAmountBeforeFee).toBe(defaultOrderParams.amount)
    })

    it('When is buy order, then should set buyAmountAfterFee', async () => {
      await getQuoteWithSigner({ ...defaultOrderParams, kind: OrderKind.BUY }, {}, orderBookApiMock)

      const call = getQuoteMock.mock.calls[0][0]

      expect(call.buyAmountAfterFee).toBe(defaultOrderParams.amount)
    })

    it('Should add advanced quote parameters', async () => {
      await getQuoteWithSigner(defaultOrderParams, { quoteRequest: { onchainOrder: { foo: 'bar' } } }, orderBookApiMock)

      const call = getQuoteMock.mock.calls[0][0]

      expect(call.onchainOrder).toEqual({ foo: 'bar' })
    })
  })

  describe('Amounts and costs', () => {
    it('Should take slippage value into account', async () => {
      const { result } = await getQuoteWithSigner({ ...defaultOrderParams, slippageBps: 20 }, {}, orderBookApiMock)
      const buyAmount = +quoteResponseMock.quote.buyAmount

      expect(+result.amountsAndCosts.afterSlippage.buyAmount.toString()).toBe(
        buyAmount - (buyAmount * 20) / (100 * 100),
      )
    })

    it('Should calculate network costs based on quote API response', async () => {
      const { result } = await getQuoteWithSigner(defaultOrderParams, {}, orderBookApiMock)

      expect(result.amountsAndCosts.costs.networkFee.amountInSellCurrency.toString()).toBe(
        quoteResponseMock.quote.feeAmount,
      )
    })

    describe('When sell ETH', () => {
      it('Default slippage should be 2% in Mainnet', async () => {
        const { result } = await getQuoteWithSigner(
          { ...defaultOrderParams, chainId: SupportedChainId.MAINNET, sellToken: ETH_ADDRESS, slippageBps: undefined },
          {},
          orderBookApiMock,
        )
        const buyAmount = +quoteResponseMock.quote.buyAmount

        // 2% slippage
        expect(+result.amountsAndCosts.afterSlippage.buyAmount.toString()).toBe(buyAmount - (buyAmount * 2) / 100)
      })

      describe.each<boolean>([true, false])('With/without dynamic slippage', (withDynamicSlippage) => {
        const slippageBps = withDynamicSlippage ? undefined : 100

        it('Quote request sell token must be a wrapped token', async () => {
          await getQuoteWithSigner(
            { ...defaultOrderParams, chainId: SupportedChainId.MAINNET, sellToken: ETH_ADDRESS, slippageBps },
            {},
            orderBookApiMock,
          )

          const call = getQuoteMock.mock.calls[0][0]

          expect(call.sellToken).toBe(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET].address)
        })

        it('Sell token in tradeParameters must not be overridden with wrapped', async () => {
          const { result } = await getQuoteWithSigner(
            { ...defaultOrderParams, chainId: SupportedChainId.MAINNET, sellToken: ETH_ADDRESS, slippageBps },
            {},
            orderBookApiMock,
          )

          expect(result.tradeParameters.sellToken).toBe(ETH_ADDRESS)
        })
      })
    })
  })

  describe('Order to sign', () => {
    it('feeAmount should always be zero', async () => {
      const { result } = await getQuoteWithSigner(defaultOrderParams, {}, orderBookApiMock)

      expect(result.orderToSign.feeAmount).toBe('0')
    })
    it('Should add appDataKeccak256 to the order', async () => {
      const { result } = await getQuoteWithSigner(defaultOrderParams, {}, orderBookApiMock)

      expect(result.orderToSign.appData.length).toBe(2 + 64)
    })
  })
})
