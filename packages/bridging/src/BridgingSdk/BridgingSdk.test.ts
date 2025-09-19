import { BridgingSdk } from './BridgingSdk'
import { MockBridgeProvider } from '../providers/mock/MockBridgeProvider'
import { QuoteBridgeRequest } from '../types'
import { assertIsBridgeQuoteAndPost, assertIsQuoteAndPost } from '../utils'
import {
  amountsAndCosts,
  appDataInfo,
  bridgeCallDetails,
  bridgeExpectedFillTimeSeconds,
  bridgeQuoteResult,
  bridgeQuoteTimestamp,
  getMockSigner,
  intermediateToken,
  intermediateTokenDecimals,
  orderQuoteResponse,
  orderToSign,
  orderTypedData,
  quoteBridgeRequest,
  tradeParameters,
} from './mock/bridgeRequestMocks'
import {
  QuoteAndPost,
  QuoteResultsWithSigner,
  SwapAdvancedSettings,
  TradeParameters,
  TradingSdk,
  WithPartialTraderParams,
} from '@cowprotocol/sdk-trading'
import { OrderBookApi, SigningScheme } from '@cowprotocol/sdk-order-book'
import { ALL_SUPPORTED_CHAINS, mainnet, optimism, sepolia, SupportedChainId } from '@cowprotocol/sdk-config'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../tests/setup'
import { expectToEqual } from '../test'

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
      it('cross-chain swap', async () => {
        const quote = await bridgingSdk.getQuote(quoteBridgeRequest)

        assertIsBridgeQuoteAndPost(quote)
        const { bridge, swap, postSwapOrderFromQuote } = quote

        expect(tradingSdk.getQuoteResults).toHaveBeenCalled()

        // Verify postSwapOrderFromQuote
        expect(postSwapOrderFromQuote).toBeDefined()

        // Verify swap result
        expectToEqual(swap.tradeParameters, tradeParameters)
        expectToEqual(swap.quoteResponse, orderQuoteResponse)
        expectToEqual(swap.orderTypedData, orderTypedData)
        expectToEqual(swap.orderToSign, orderToSign)
        expectToEqual(swap.appDataInfo, appDataInfo)
        expectToEqual(swap.amountsAndCosts, amountsAndCosts)

        // Verify basic bridge info
        expectToEqual(bridge.providerInfo, new MockBridgeProvider().info)
        expectToEqual(bridge.quoteTimestamp, bridgeQuoteTimestamp)
        expectToEqual(bridge.expectedFillTimeSeconds, bridgeExpectedFillTimeSeconds)

        expect(bridge.isSell).toEqual(true)
        expectToEqual(bridge.tradeParameters, {
          ...quoteBridgeRequest,
          sellTokenAddress: intermediateToken, // The sell token of the bridging should be the intermediate token
          sellTokenDecimals: intermediateTokenDecimals,
          amount: BigInt(100 * 10 ** intermediateTokenDecimals).toString(),
        })

        // Verify amounts and costs
        const { amountsAndCosts: swapAmountsAndCosts } = swap
        expectToEqual(swapAmountsAndCosts.isSell, amountsAndCosts.isSell)
        expectToEqual(swapAmountsAndCosts.beforeNetworkCosts, amountsAndCosts.beforeNetworkCosts)
        expectToEqual(swapAmountsAndCosts.afterNetworkCosts, amountsAndCosts.afterNetworkCosts)
        expectToEqual(swapAmountsAndCosts.afterPartnerFees, amountsAndCosts.afterPartnerFees)
        expectToEqual(swapAmountsAndCosts.afterSlippage, amountsAndCosts.afterSlippage)
        expectToEqual(swapAmountsAndCosts.costs, amountsAndCosts.costs)

        // Verify bridge call details
        expectToEqual(bridge.bridgeCallDetails.preAuthorizedBridgingHook, bridgeCallDetails.preAuthorizedBridgingHook)
        expectToEqual(bridge.bridgeCallDetails.unsignedBridgeCall, bridgeCallDetails.unsignedBridgeCall)

        // Verify postSwapOrderFromQuote
        expect(postSwapOrderFromQuote).toBeDefined()
      })

      it('single-chain swap', async () => {
        const mainnetDai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
        const mainnetDaiDecimals = 18

        const justBridgeParams: QuoteBridgeRequest = {
          ...quoteBridgeRequest,

          buyTokenChainId: SupportedChainId.MAINNET,
          buyTokenAddress: mainnetDai,
          buyTokenDecimals: mainnetDaiDecimals,
        }

        const { sellTokenAddress, buyTokenAddress, amount, ...rest } = justBridgeParams
        const tradeParameters: WithPartialTraderParams<TradeParameters> = {
          ...rest,
          sellToken: sellTokenAddress,
          buyToken: buyTokenAddress,
          amount: amount.toString(),
          chainId: SupportedChainId.MAINNET,
        }

        const singleChainQuoteResult: QuoteAndPost = {
          quoteResults: {
            tradeParameters,
            amountsAndCosts,
            orderToSign,
            quoteResponse: orderQuoteResponse,
            appDataInfo,
            orderTypedData,
            suggestedSlippageBps: 0,
          },
          postSwapOrderFromQuote: () =>
            Promise.resolve({
              orderId: '0x01',
              signature: '0x02',
              signingScheme: SigningScheme.EIP712,
              orderToSign,
            }),
        }
        tradingSdk.getQuote = jest.fn().mockResolvedValue(singleChainQuoteResult)

        // When asking for a quote to the bridging sdk
        const quote = await bridgingSdk.getQuote(justBridgeParams)

        // We get a single-chain quote
        assertIsQuoteAndPost(quote)
        const { quoteResults, postSwapOrderFromQuote } = quote

        // Verify the bridging SDK detegates to the trading sdk
        expect(tradingSdk.getQuote).toHaveBeenCalledWith(tradeParameters, undefined)

        // Verify the results matches expected results
        expect(quoteResults.amountsAndCosts).toEqual(amountsAndCosts)
        expect(quoteResults.tradeParameters).toEqual(tradeParameters)
        expect(quoteResults.orderToSign).toEqual(orderToSign)
        expect(quoteResults.quoteResponse).toEqual(orderQuoteResponse)
        expect(quoteResults.appDataInfo).toEqual(appDataInfo)
        expect(quoteResults.orderTypedData).toEqual(orderTypedData)

        // Verify postSwapOrderFromQuote
        expect(postSwapOrderFromQuote).toBeDefined()
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

      it('should get quotes from all providers when no specific providers requested', async () => {
        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
        })

        expect(results).toHaveLength(3)
        expect(results[0]?.providerDappId).toBe('mockProvider')
        expect(results[1]?.providerDappId).toBe('cow-sdk://bridging/providers/mock2')
        expect(results[2]?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')

        // All should be successful
        results.forEach(result => {
          expect(result.quote).toBeTruthy()
          expect(result.error).toBeUndefined()
        })

        // Verify all providers were called (note: the actual request may be modified by getQuoteWithBridge)
        expect(mockProvider.getQuote).toHaveBeenCalled()
        expect(mockProvider2.getQuote).toHaveBeenCalled()
        expect(mockProvider3.getQuote).toHaveBeenCalled()
      })

      it('should get quotes from specific providers when requested', async () => {
        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock3'],
        })

        expect(results).toHaveLength(2)
        expect(results[0]?.providerDappId).toBe('mockProvider')
        expect(results[1]?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')

        // All should be successful
        results.forEach(result => {
          expect(result.quote).toBeTruthy()
          expect(result.error).toBeUndefined()
        })

        // Verify only requested providers were called
        expect(mockProvider.getQuote).toHaveBeenCalled()
        expect(mockProvider2.getQuote).not.toHaveBeenCalled()
        expect(mockProvider3.getQuote).toHaveBeenCalled()
      })

      it('should handle provider errors gracefully', async () => {
        const error = new Error('Provider failed')
        mockProvider2.getQuote = jest.fn().mockRejectedValue(error)

        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
        })

        expect(results).toHaveLength(3)

        // First provider should succeed
        expect(results[0]?.providerDappId).toBe('mockProvider')
        expect(results[0]?.quote).toBeTruthy()
        expect(results[0]?.error).toBeUndefined()

        // Second provider should fail
        expect(results[1]?.providerDappId).toBe('cow-sdk://bridging/providers/mock2')
        expect(results[1]?.quote).toBeNull()
        expect(results[1]?.error).toBeTruthy()
        expect(results[1]?.error?.message).toContain('Provider failed')

        // Third provider should succeed
        expect(results[2]?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')
        expect(results[2]?.quote).toBeTruthy()
        expect(results[2]?.error).toBeUndefined()
      })

      it('should throw error for same-chain requests', async () => {
        const sameChainRequest = {
          ...quoteBridgeRequest,
          buyTokenChainId: quoteBridgeRequest.sellTokenChainId,
        }

        await expect(
          bridgingSdk.getMultiQuotes({
            quoteBridgeRequest: sameChainRequest,
          })
        ).rejects.toThrow(
          'getMultiQuotes() is only for cross-chain bridging. For single-chain swaps, use getQuote() instead.'
        )
      })

      it('should throw error for unknown provider dappId', async () => {
        await expect(
          bridgingSdk.getMultiQuotes({
            quoteBridgeRequest,
            providerDappIds: ['unknown-provider'],
          })
        ).rejects.toThrow(
          "Provider with dappId 'unknown-provider' not found. Available providers: mockProvider, cow-sdk://bridging/providers/mock2, cow-sdk://bridging/providers/mock3"
        )
      })

      it('should pass advanced settings to bridge quotes', async () => {
        const advancedSettings: SwapAdvancedSettings = {
          quoteRequest: {
            validTo: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          },
        }

        await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          advancedSettings,
        })

        // Verify advanced settings were passed through (may have additional appData)
        expect(tradingSdk.getQuoteResults).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            quoteRequest: expect.objectContaining({
              validTo: expect.any(Number),
            }),
          })
        )
      })

      it('should execute quotes in parallel', async () => {
        let provider1StartTime = 0
        let provider2StartTime = 0

        mockProvider.getQuote = jest.fn().mockImplementation(async () => {
          provider1StartTime = Date.now()
          await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay
          return bridgeQuoteResult
        })

        mockProvider2.getQuote = jest.fn().mockImplementation(async () => {
          provider2StartTime = Date.now()
          await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay
          return bridgeQuoteResult
        })

        const startTime = Date.now()
        await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
        })
        const totalTime = Date.now() - startTime

        // Verify parallel execution: total time should be roughly the same as individual execution
        // (not the sum of both executions)
        expect(totalTime).toBeLessThan(180) // Should be less than 180ms (100ms + buffer)

        // Verify both providers started around the same time (parallel execution)
        expect(provider1StartTime).toBeDefined()
        expect(provider2StartTime).toBeDefined()
        const timeDiff = Math.abs(provider1StartTime - provider2StartTime)
        expect(timeDiff).toBeLessThan(50) // Should start within 50ms of each other
      })

      it('should return quotes with correct structure', async () => {
        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider'],
        })

        expect(results).toHaveLength(1)
        const result = results[0]
        expect(result).toBeDefined()

        if (result) {
          expect(result).toHaveProperty('providerDappId')
          expect(result).toHaveProperty('quote')
          expect(result).toHaveProperty('error')

          expect(result.providerDappId).toBe('mockProvider')
          expect(result.quote).toBeTruthy()
          expect(result.error).toBeUndefined()

          // Verify quote structure
          if (result.quote) {
            assertIsBridgeQuoteAndPost(result.quote)
            expect(result.quote.bridge).toBeTruthy()
            expect(result.quote.swap).toBeTruthy()
            expect(result.quote.postSwapOrderFromQuote).toBeTruthy()
          }
        }
      })
    })
  })
})
