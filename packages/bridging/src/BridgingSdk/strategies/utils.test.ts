import { fetchMultiQuote } from './utils'
import { MockHookBridgeProvider } from '../../providers/mock/HookMockBridgeProvider'
import {
  bridgeQuoteResult,
  getMockSigner,
  quoteBridgeRequest,
  amountsAndCosts,
  appDataInfo,
  orderQuoteResponse,
  orderToSign,
  orderTypedData,
  tradeParameters,
} from '../mock/bridgeRequestMocks'
import { QuoteResultsWithSigner, TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { mainnet, optimism, sepolia, SupportedEvmChainId } from '@cowprotocol/sdk-config'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../../tests/setup'
import { MultiQuoteContext } from '../../types'
import { getQuoteWithBridge } from '../getQuoteWithBridge'

// Mock the getQuoteWithBridge function
jest.mock('../getQuoteWithBridge')

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe(`fetchMultiQuote with ${adapterName}`, () => {
    let mockProvider: MockHookBridgeProvider
    let tradingSdk: TradingSdk
    let orderBookApi: OrderBookApi
    let quoteResult: QuoteResultsWithSigner

    beforeEach(async () => {
      jest.clearAllMocks()

      const adapter = adapters[adapterName]
      setGlobalAdapter(adapter)

      const signer = getMockSigner(adapter)
      quoteBridgeRequest.signer = signer

      mockProvider = new MockHookBridgeProvider()
      mockProvider.getQuote = jest.fn().mockResolvedValue(bridgeQuoteResult)

      orderBookApi = {
        context: {
          chainId: SupportedEvmChainId.GNOSIS_CHAIN,
        },
        getQuote: jest.fn().mockResolvedValue(orderQuoteResponse),
        sendOrder: jest.fn().mockResolvedValue('0x01'),
      } as unknown as OrderBookApi

      tradingSdk = new TradingSdk({}, { orderBookApi })
      quoteResult = {
        orderBookApi,
        result: {
          tradeParameters,
          orderToSign,
          amountsAndCosts,
          appDataInfo,
          quoteResponse: orderQuoteResponse,
          orderTypedData,
          signer,
          suggestedSlippageBps: 0,
        },
      }
      tradingSdk.getQuoteResults = jest.fn().mockResolvedValue(quoteResult)

      // Mock getQuoteWithBridge to return the bridge quote result
      ;(getQuoteWithBridge as jest.Mock).mockResolvedValue(bridgeQuoteResult)
    })

    describe('Network Support Validation', () => {
      it('should return undefined when provider does not support the requested buyTokenChainId', async () => {
        // Mock getNetworks to return only mainnet, optimism, and sepolia (no BASE)
        mockProvider.getNetworks = jest.fn().mockResolvedValue([mainnet, optimism, sepolia])

        const context: MultiQuoteContext = {
          provider: mockProvider,
          quoteBridgeRequest, // uses SupportedChainId.BASE
          advancedSettings: undefined,
          providerTimeout: 10000,
          onQuoteResult: undefined,
        }

        const result = await fetchMultiQuote(context, tradingSdk)

        // Should return undefined because BASE is not supported
        expect(result).toBeUndefined()

        // getQuoteWithBridge should NOT have been called
        expect(getQuoteWithBridge).not.toHaveBeenCalled()

        // Provider's getNetworks should have been called
        expect(mockProvider.getNetworks).toHaveBeenCalled()
      })

      it('should fetch quote when provider supports the requested buyTokenChainId', async () => {
        // Mock getNetworks to include BASE
        const baseNetwork = { id: SupportedEvmChainId.BASE, name: 'Base', shortName: 'base' }
        mockProvider.getNetworks = jest.fn().mockResolvedValue([mainnet, optimism, sepolia, baseNetwork])

        const context: MultiQuoteContext = {
          provider: mockProvider,
          quoteBridgeRequest, // uses SupportedChainId.BASE
          advancedSettings: undefined,
          providerTimeout: 10000,
          onQuoteResult: undefined,
        }

        const result = await fetchMultiQuote(context, tradingSdk)

        // Should return a result with the quote
        expect(result).toBeDefined()
        expect(result?.providerDappId).toBe(mockProvider.info.dappId)
        expect(result?.quote).toEqual(bridgeQuoteResult)
        expect(result?.error).toBeUndefined()

        // getQuoteWithBridge should have been called
        expect(getQuoteWithBridge).toHaveBeenCalledWith(
          mockProvider,
          expect.objectContaining({
            swapAndBridgeRequest: quoteBridgeRequest,
            tradingSdk,
          }),
        )

        // Provider's getNetworks should have been called
        expect(mockProvider.getNetworks).toHaveBeenCalled()
      })
    })
  })
})
