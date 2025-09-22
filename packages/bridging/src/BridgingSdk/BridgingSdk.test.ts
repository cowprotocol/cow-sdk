import { BridgingSdk } from './BridgingSdk'
import { MockBridgeProvider } from '../providers/mock/MockBridgeProvider'
import { assertIsBridgeQuoteAndPost } from '../utils'
import {
  amountsAndCosts,
  appDataInfo,
  bridgeCallDetails,
  bridgeQuoteResult,
  getMockSigner,
  orderQuoteResponse,
  orderToSign,
  orderTypedData,
  quoteBridgeRequest,
  tradeParameters,
} from './mock/bridgeRequestMocks'
import { QuoteResultsWithSigner, SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { ALL_SUPPORTED_CHAINS, mainnet, optimism, sepolia, SupportedChainId } from '@cowprotocol/sdk-config'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../tests/setup'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe(`BridgingSdk with ${adapterName}`, () => {
    let bridgingSdk: BridgingSdk
    let tradingSdk: TradingSdk
    let orderBookApi: OrderBookApi
    let quoteResult: QuoteResultsWithSigner

    const mockProvider = new MockBridgeProvider()
    mockProvider.getQuote = jest.fn().mockResolvedValue(bridgeQuoteResult)
    mockProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
    mockProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks()

      const adapter = adapters[adapterName]

      setGlobalAdapter(adapter)

      const signer = getMockSigner(adapter)

      quoteBridgeRequest.signer = signer

      orderBookApi = {
        context: {
          chainId: SupportedChainId.GNOSIS_CHAIN,
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

      bridgingSdk = new BridgingSdk({
        providers: [mockProvider],
        tradingSdk,
      })
    })

    describe('getProviders', () => {
      it('returns the providers', () => {
        const providers = bridgingSdk.getProviders()
        expect(providers).toEqual([mockProvider])
      })
    })

    describe('getSourceNetworks', () => {
      it('no networks are supported', async () => {
        const networks = await bridgingSdk.getSourceNetworks()
        expect(networks).toEqual(ALL_SUPPORTED_CHAINS)
      })
    })

    describe('getTargetNetworks', () => {
      it('no networks are supported', async () => {
        mockProvider.getNetworks = jest.fn().mockResolvedValue([])

        const networks = await bridgingSdk.getTargetNetworks()
        expect(mockProvider.getNetworks).toHaveBeenCalled()
        expect(networks).toEqual([])
      })

      it('list of supported networks', async () => {
        const expectedNetworks = [mainnet, optimism, sepolia]
        mockProvider.getNetworks = jest.fn().mockResolvedValue(expectedNetworks)

        const networks = await bridgingSdk.getTargetNetworks()
        expect(mockProvider.getNetworks).toHaveBeenCalled()
        expect(networks).toEqual(expectedNetworks)
      })

      it('errors buble up', async () => {
        mockProvider.getNetworks = jest.fn().mockRejectedValue(new Error("don't ask for networks"))

        await expect(bridgingSdk.getTargetNetworks()).rejects.toThrow("don't ask for networks")
      })
    })

    describe('getQuote', () => {
      it('should delegate to SingleQuoteStrategy', async () => {
        const quote = await bridgingSdk.getQuote(quoteBridgeRequest)

        // Verify that the strategy pattern is working
        assertIsBridgeQuoteAndPost(quote)
        expect(quote.bridge).toBeTruthy()
        expect(quote.swap).toBeTruthy()
        expect(quote.postSwapOrderFromQuote).toBeDefined()

        // Verify that the underlying trading SDK was called
        expect(tradingSdk.getQuoteResults).toHaveBeenCalled()
      })

      it('should pass advanced settings to strategy', async () => {
        const advancedSettings: SwapAdvancedSettings = {
          quoteRequest: {
            validTo: 1758524284,
          },
        }

        await bridgingSdk.getQuote(quoteBridgeRequest, advancedSettings)

        // Verify advanced settings were passed through to the strategy
        expect(tradingSdk.getQuoteResults).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            quoteRequest: expect.objectContaining({
              validTo: 1758524284,
            }),
          }),
        )
      })
    })

    describe('getMultiQuotes', () => {
      let mockProvider2: MockBridgeProvider
      let mockProvider3: MockBridgeProvider

      beforeEach(() => {
        mockProvider2 = new MockBridgeProvider()
        mockProvider2.info.dappId = 'cow-sdk://bridging/providers/mock2'
        mockProvider2.info.name = 'Mock Bridge Provider 2'
        mockProvider2.getQuote = jest.fn().mockResolvedValue(bridgeQuoteResult)
        mockProvider2.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        mockProvider2.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        mockProvider3 = new MockBridgeProvider()
        mockProvider3.info.dappId = 'cow-sdk://bridging/providers/mock3'
        mockProvider3.info.name = 'Mock Bridge Provider 3'
        mockProvider3.getQuote = jest.fn().mockResolvedValue(bridgeQuoteResult)
        mockProvider3.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        mockProvider3.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        // Create SDK with multiple providers
        bridgingSdk = new BridgingSdk({
          providers: [mockProvider, mockProvider2, mockProvider3],
          tradingSdk,
        })
      })

      it('should delegate to MultiQuoteStrategy', async () => {
        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
        })

        // Verify that the strategy pattern is working
        expect(results).toHaveLength(3)
        expect(results[0]?.providerDappId).toBe('mockProvider')
        expect(results[1]?.providerDappId).toBe('cow-sdk://bridging/providers/mock2')
        expect(results[2]?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')

        // All should be successful
        results.forEach((result) => {
          expect(result.quote).toBeTruthy()
          expect(result.error).toBeUndefined()
        })
      })

      it('should pass options to strategy', async () => {
        const onQuoteResult = jest.fn()

        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          options: {
            onQuoteResult,
            totalTimeout: 30000,
            providerTimeout: 15000,
          },
        })

        // Verify callbacks were called (indicating options were passed through)
        expect(onQuoteResult).toHaveBeenCalled()
        expect(results).toHaveLength(3)
      })

      it('should pass provider filter to strategy', async () => {
        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock3'],
        })

        // Verify only specified providers were used
        expect(results).toHaveLength(2)
        expect(results[0]?.providerDappId).toBe('mockProvider')
        expect(results[1]?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')
      })
    })

    describe('getBestQuote', () => {
      let mockProvider2: MockBridgeProvider
      let mockProvider3: MockBridgeProvider

      beforeEach(async () => {
        mockProvider2 = new MockBridgeProvider()
        mockProvider2.info.dappId = 'cow-sdk://bridging/providers/mock2'
        mockProvider2.info.name = 'Mock Bridge Provider 2'
        // Override mockProvider to have a medium quote (50 ETH)
        mockProvider.getQuote = jest.fn().mockResolvedValue({
          ...bridgeQuoteResult,
          amountsAndCosts: {
            ...bridgeQuoteResult.amountsAndCosts,
            afterSlippage: {
              ...bridgeQuoteResult.amountsAndCosts.afterSlippage,
              buyAmount: BigInt('50000000000000000000'), // 50 ETH - middle
            },
          },
        })

        mockProvider2.getQuote = jest.fn().mockResolvedValue({
          ...bridgeQuoteResult,
          amountsAndCosts: {
            ...bridgeQuoteResult.amountsAndCosts,
            afterSlippage: {
              ...bridgeQuoteResult.amountsAndCosts.afterSlippage,
              buyAmount: BigInt('40000000000000000000'), // 40 ETH - lower than mockProvider
            },
          },
        })
        mockProvider2.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        mockProvider2.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        mockProvider3 = new MockBridgeProvider()
        mockProvider3.info.dappId = 'cow-sdk://bridging/providers/mock3'
        mockProvider3.info.name = 'Mock Bridge Provider 3'
        mockProvider3.getQuote = jest.fn().mockResolvedValue({
          ...bridgeQuoteResult,
          amountsAndCosts: {
            ...bridgeQuoteResult.amountsAndCosts,
            afterSlippage: {
              ...bridgeQuoteResult.amountsAndCosts.afterSlippage,
              buyAmount: BigInt('60000000000000000000'), // 60 ETH - higher than mockProvider
            },
          },
        })
        mockProvider3.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        mockProvider3.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        bridgingSdk = new BridgingSdk({
          providers: [mockProvider, mockProvider2, mockProvider3],
          tradingSdk,
        })
      })

      it('should delegate to BestQuoteStrategy and return best quote', async () => {
        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
        })

        // Verify that the strategy pattern is working and returns best quote
        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')
        expect(result?.quote).toBeTruthy()
        expect(result?.error).toBeUndefined()

        // Verify it's actually the best quote (60 ETH)
        expect(result?.quote?.bridge.amountsAndCosts.afterSlippage.buyAmount).toBe(BigInt('60000000000000000000'))
      })

      it('should pass options to strategy including callbacks', async () => {
        const onQuoteResult = jest.fn()

        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
          options: {
            onQuoteResult,
            totalTimeout: 30000,
            providerTimeout: 15000,
          },
        })

        // Verify callbacks were called (indicating options were passed through)
        expect(onQuoteResult).toHaveBeenCalled()
        expect(result).toBeTruthy()
      })

      it('should pass provider filter to strategy', async () => {
        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider'],
        })

        // Verify only specified provider was used
        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('mockProvider')
        expect(result?.quote).toBeTruthy()
      })
    })
  })
})
