import { TradingSdk } from './tradingSdk'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { TradeBaseParameters } from './types'
import { OrderBookApi, OrderKind } from '@cowprotocol/sdk-order-book'
import { AdaptersTestSetup, createAdapters } from '../tests/setup'
import { AbstractProviderAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'

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

describe('TradingSdk', () => {
  let orderBookApi: OrderBookApi
  let adapters: AdaptersTestSetup

  beforeAll(() => {
    adapters = createAdapters()
  })

  describe('Logs', () => {
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

    it('When logs option is set to false, then should not display logs', async () => {
      const logSpy = jest.spyOn(console, 'log')
      const adapterNames = Object.keys(adapters) as Array<keyof AdaptersTestSetup>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName] as AbstractProviderAdapter
        setGlobalAdapter(adapter)
        const sdk = new TradingSdk(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { enableLogging: false, orderBookApi },
        )

        await sdk.getQuote(defaultOrderParams)

        expect(logSpy.mock.calls.length).toBe(0)
      }
    })

    it('When logs option is set to true, then should display logs', async () => {
      const logSpy = jest.spyOn(console, 'log')
      const adapterNames = Object.keys(adapters) as Array<keyof AdaptersTestSetup>

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName] as AbstractProviderAdapter
        setGlobalAdapter(adapter)
        const sdk = new TradingSdk(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { enableLogging: true, orderBookApi },
        )

        await sdk.getQuote(defaultOrderParams)

        expect(logSpy.mock.calls[0]?.[0]).toContain('[COW SDK]')
      }
    })
  })
})
