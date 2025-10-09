import { ETH_FLOW_DEFAULT_SLIPPAGE_BPS } from './consts'
import { getQuoteWithSigner } from './getQuote'
import { SwapParameters } from './types'
import { ETH_ADDRESS, WRAPPED_NATIVE_CURRENCIES, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi, OrderKind, OrderQuoteResponse } from '@cowprotocol/sdk-order-book'
import { AdaptersTestSetup, createAdapters } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

jest.mock('./suggestSlippageBps', () => ({
  suggestSlippageBps: jest.fn(),
}))

jest.mock('./resolveSlippageSuggestion', () => ({
  resolveSlippageSuggestion: jest.fn(),
}))

const { resolveSlippageSuggestion } = jest.requireMock('./resolveSlippageSuggestion')

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

describe('getQuote', () => {
  let adapters: AdaptersTestSetup

  beforeAll(() => {
    adapters = createAdapters()
  })

  beforeEach(() => {
    getQuoteMock.mockReset()
    getQuoteMock.mockResolvedValue(quoteResponseMock)
    resolveSlippageSuggestion.mockReset()
    resolveSlippageSuggestion.mockResolvedValue({ slippageBps: null })
  })

  describe('App data', () => {
    it('Should add slippageBps and appCode from parameters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer, slippageBps: 76 },
          {},
          orderBookApiMock,
        )
        results.push(result)
      }

      results.forEach(({ result }) => {
        const appData = JSON.parse(result.appDataInfo.fullAppData)

        expect(appData.metadata.quote.slippageBips).toBe(76)
        expect(appData.appCode).toBe(defaultOrderParams.appCode)
      })
    })

    it('Should add advanced appData parameters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer },
          {
            appData: {
              environment: 'barn',
            },
          },
          orderBookApiMock,
        )
        results.push(result)
      }

      results.forEach(({ result }) => {
        const appData = JSON.parse(result.appDataInfo.fullAppData)
        expect(appData.environment).toBe('barn')
      })
    })
  })

  describe('Quote request', () => {
    describe('When sell ETH', () => {
      it('Then should override sell token with wrapped one', async () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          await getQuoteWithSigner(
            {
              ...defaultOrderParams,
              signer: adapters[adapterName].signer,
              sellToken: ETH_ADDRESS,
              slippageBps: undefined,
            },
            {},
            orderBookApiMock,
          )

          const call = getQuoteMock.mock.calls[0][0]
          expect(call.sellToken).toBe(WRAPPED_NATIVE_CURRENCIES[defaultOrderParams.chainId].address)
        }
      })

      it('Default slippage should be 2%', async () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          await getQuoteWithSigner(
            {
              ...defaultOrderParams,
              signer: adapters[adapterName].signer,
              sellToken: ETH_ADDRESS,
              slippageBps: undefined,
            },
            {},
            orderBookApiMock,
          )

          const call = getQuoteMock.mock.calls[0][0]
          const appData = JSON.parse(call.appData)
          expect(appData.metadata.quote.slippageBips).toBe(ETH_FLOW_DEFAULT_SLIPPAGE_BPS[defaultOrderParams.chainId])
        }
      })
    })

    it('Should add appData to the request', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await getQuoteWithSigner({ ...defaultOrderParams, signer: adapters[adapterName].signer }, {}, orderBookApiMock)

        const call = getQuoteMock.mock.calls[0][0]
        const appData = JSON.parse(call.appData)

        expect(appData.appCode).toBe(defaultOrderParams.appCode)
        expect(appData.metadata.quote.slippageBips).toBe(defaultOrderParams.slippageBps)
      }
    })

    it('priceQuality must always be OPTIMAL', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await getQuoteWithSigner({ ...defaultOrderParams, signer: adapters[adapterName].signer }, {}, orderBookApiMock)

        const call = getQuoteMock.mock.calls[0][0]
        expect(call.priceQuality).toBe('optimal')
      }
    })

    it('When is sell order, then should set sellAmountBeforeFee', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer, kind: OrderKind.SELL },
          {},
          orderBookApiMock,
        )

        const call = getQuoteMock.mock.calls[0][0]
        expect(call.sellAmountBeforeFee).toBe(defaultOrderParams.amount)
      }
    })

    it('When is buy order, then should set buyAmountAfterFee', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer, kind: OrderKind.BUY },
          {},
          orderBookApiMock,
        )

        const call = getQuoteMock.mock.calls[0][0]
        expect(call.buyAmountAfterFee).toBe(defaultOrderParams.amount)
      }
    })

    it('Should add advanced quote parameters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer },
          { quoteRequest: { onchainOrder: { foo: 'bar' } } },
          orderBookApiMock,
        )

        const call = getQuoteMock.mock.calls[0][0]
        expect(call.onchainOrder).toEqual({ foo: 'bar' })
      }
    })

    it('Should use validFor by default when validTo is not provided', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await getQuoteWithSigner({ ...defaultOrderParams, signer: adapters[adapterName].signer }, {}, orderBookApiMock)

        const call = getQuoteMock.mock.calls[0][0]
        expect(call.validFor).toBeDefined()
        expect(call.validTo).toBeUndefined()
      }
    })

    it('Should use DEFAULT_QUOTE_VALIDITY when neither validFor nor validTo are provided', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const orderParamsWithoutValidity = { ...defaultOrderParams, signer: adapters[adapterName].signer }
        // Explicitly ensure neither validFor nor validTo are provided
        delete (orderParamsWithoutValidity as any).validFor
        delete (orderParamsWithoutValidity as any).validTo

        await getQuoteWithSigner(orderParamsWithoutValidity, {}, orderBookApiMock)

        const call = getQuoteMock.mock.calls[0][0]
        expect(call.validFor).toBe(1800) // DEFAULT_QUOTE_VALIDITY = 60 * 30 = 1800 seconds
        expect(call.validTo).toBeUndefined()
      }
    })

    it('Should use exact validTo when provided', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const exactValidTo = 2524608000 // January 1, 2050 00:00:00 UTC

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await getQuoteWithSigner({ ...defaultOrderParams, signer: adapters[adapterName].signer, validTo: exactValidTo }, {}, orderBookApiMock)

        const call = getQuoteMock.mock.calls[0][0]
        expect(call.validTo).toBe(exactValidTo)
        expect(call.validFor).toBeUndefined()
      }
    })

    it('Should throw error when both validFor and validTo are provided', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const exactValidTo = 2524608000 // January 1, 2050 00:00:00 UTC

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await expect(
          getQuoteWithSigner({ ...defaultOrderParams, signer: adapters[adapterName].signer, validTo: exactValidTo, validFor: 600 }, {}, orderBookApiMock)
        ).rejects.toThrow('Cannot specify both validFor and validTo. Use validFor for relative time or validTo for absolute time.')
      }
    })
  })

  describe('Amounts and costs', () => {
    it('Should take slippage value into account', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer, slippageBps: 20 },
          {},
          orderBookApiMock,
        )
        results.push(result)
      }

      const buyAmount = +quoteResponseMock.quote.buyAmount
      results.forEach(({ result }) => {
        expect(+result.amountsAndCosts.afterSlippage.buyAmount.toString()).toBe(
          buyAmount - (buyAmount * 20) / (100 * 100),
        )
      })
    })

    it('Should calculate network costs based on quote API response', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer },
          {},
          orderBookApiMock,
        )
        results.push(result)
      }

      results.forEach(({ result }) => {
        expect(result.amountsAndCosts.costs.networkFee.amountInSellCurrency.toString()).toBe(
          quoteResponseMock.quote.feeAmount,
        )
      })
    })
  })

  describe('Order to sign', () => {
    it('feeAmount should always be zero', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer },
          {},
          orderBookApiMock,
        )
        results.push(result)
      }

      results.forEach(({ result }) => {
        expect(result.orderToSign.feeAmount).toBe('0')
      })
    })

    it('Should add appDataKeccak256 to the order', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer },
          {},
          orderBookApiMock,
        )
        results.push(result)
      }

      results.forEach(({ result }) => {
        expect(result.orderToSign.appData.length).toBe(2 + 64)
      })
    })
  })

  describe('Slippage suggestion integration', () => {
    it('Should use suggested slippage when AUTO slippage is used and suggestion is provided', async () => {
      resolveSlippageSuggestion.mockResolvedValue({ slippageBps: 200 })
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = await getQuoteWithSigner(
          {
            ...defaultOrderParams,
            signer: adapters[adapterName].signer,
            slippageBps: undefined, // AUTO slippage
          },
          {},
          orderBookApiMock,
        )
        results.push(result)
      }

      results.forEach(({ result }) => {
        expect(result.suggestedSlippageBps).toBe(200)
        const appData = JSON.parse(result.appDataInfo.fullAppData)
        expect(appData.metadata.quote.slippageBips).toBe(200)
      })
    })

    it('Should use default slippage when suggested slippage is null', async () => {
      resolveSlippageSuggestion.mockResolvedValue({ slippageBps: null })
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = await getQuoteWithSigner(
          {
            ...defaultOrderParams,
            signer: adapters[adapterName].signer,
            slippageBps: undefined, // AUTO slippage
          },
          {},
          orderBookApiMock,
        )
        results.push(result)
      }

      results.forEach(({ result }) => {
        expect(result.suggestedSlippageBps).toBe(50) // Default slippage for non-EthFlow
      })
    })

    it('Should pass getSlippageSuggestion callback from advanced settings', async () => {
      const mockCallback = jest.fn().mockResolvedValue({ slippageBps: 300 })
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await getQuoteWithSigner(
          { ...defaultOrderParams, signer: adapters[adapterName].signer },
          { getSlippageSuggestion: mockCallback },
          orderBookApiMock,
        )

        expect(resolveSlippageSuggestion).toHaveBeenCalledWith(
          defaultOrderParams.chainId,
          expect.any(Object),
          expect.any(Object),
          quoteResponseMock,
          false,
          expect.objectContaining({ getSlippageSuggestion: mockCallback }),
        )
      }
    })

    it('Should handle EthFlow orders correctly', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await getQuoteWithSigner(
          {
            ...defaultOrderParams,
            signer: adapters[adapterName].signer,
            sellToken: ETH_ADDRESS,
          },
          {},
          orderBookApiMock,
        )

        expect(resolveSlippageSuggestion).toHaveBeenCalledWith(
          defaultOrderParams.chainId,
          expect.any(Object),
          expect.any(Object),
          quoteResponseMock,
          true, // isEthFlow should be true
          expect.any(Object),
        )
      }
    })
  })
})
