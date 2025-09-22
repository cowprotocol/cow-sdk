import { BridgingSdk } from './BridgingSdk'
import { MockBridgeProvider } from '../providers/mock/MockBridgeProvider'
import { MultiQuoteResult, QuoteBridgeRequest } from '../types'
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
        results.forEach((result) => {
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
        results.forEach((result) => {
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

        // Results should be sorted with successful quotes first
        // First two results should be successful (mockProvider and mock3)
        const successfulResults = results.filter(r => r.quote)
        const failedResults = results.filter(r => !r.quote)

        expect(successfulResults).toHaveLength(2)
        expect(failedResults).toHaveLength(1)

        // Successful providers (order may vary within successful group)
        const successfulProviderIds = successfulResults.map(r => r.providerDappId)
        expect(successfulProviderIds).toContain('mockProvider')
        expect(successfulProviderIds).toContain('cow-sdk://bridging/providers/mock3')

        // Failed provider should come last
        expect(failedResults[0]?.providerDappId).toBe('cow-sdk://bridging/providers/mock2')
        expect(failedResults[0]?.quote).toBeNull()
        expect(failedResults[0]?.error).toBeTruthy()
        expect(failedResults[0]?.error?.message).toContain('Provider failed')
      })

      it('should throw error for same-chain requests', async () => {
        const sameChainRequest = {
          ...quoteBridgeRequest,
          buyTokenChainId: quoteBridgeRequest.sellTokenChainId,
        }

        await expect(
          bridgingSdk.getMultiQuotes({
            quoteBridgeRequest: sameChainRequest,
          }),
        ).rejects.toThrow(
          'getMultiQuotes() and getBestQuote() are only for cross-chain bridging. For single-chain swaps, use getQuote() instead.',
        )
      })

      it('should throw error for unknown provider dappId', async () => {
        await expect(
          bridgingSdk.getMultiQuotes({
            quoteBridgeRequest,
            providerDappIds: ['unknown-provider'],
          }),
        ).rejects.toThrow(
          "Provider with dappId 'unknown-provider' not found. Available providers: mockProvider, cow-sdk://bridging/providers/mock2, cow-sdk://bridging/providers/mock3",
        )
      })

      it('should pass advanced settings to bridge quotes', async () => {
        const validToMock = 1758524284

        const advancedSettings: SwapAdvancedSettings = {
          quoteRequest: {
            validTo: validToMock,
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
              validTo: validToMock,
            }),
          }),
        )
      })

      it('should execute quotes in parallel', async () => {
        let provider1StartTime = 0
        let provider2StartTime = 0

        mockProvider.getQuote = jest.fn().mockImplementation(async () => {
          provider1StartTime = Date.now()
          await new Promise((resolve) => setTimeout(resolve, 100)) // 100ms delay
          return bridgeQuoteResult
        })

        mockProvider2.getQuote = jest.fn().mockImplementation(async () => {
          provider2StartTime = Date.now()
          await new Promise((resolve) => setTimeout(resolve, 100)) // 100ms delay
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

      it('should support progressive results with onQuoteResult callback', async () => {
        const progressiveResults: MultiQuoteResult[] = []
        const onQuoteResult = jest.fn((result: MultiQuoteResult) => {
          progressiveResults.push(result)
        })

        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
          options: {
            onQuoteResult,
          },
        })

        // Should have received 2 progressive callbacks
        expect(onQuoteResult).toHaveBeenCalledTimes(2)
        expect(progressiveResults).toHaveLength(2)

        // Progressive results should contain both providers (order may vary due to async execution)
        const progressiveProviderIds = progressiveResults.map((r) => r.providerDappId).sort()
        expect(progressiveProviderIds).toEqual(['cow-sdk://bridging/providers/mock2', 'mockProvider'])

        // Final results should also be complete
        expect(results).toHaveLength(2)
        const finalProviderIds = results.map((r) => r.providerDappId).sort()
        expect(finalProviderIds).toEqual(['cow-sdk://bridging/providers/mock2', 'mockProvider'])
      })

      it('should handle callback errors gracefully without affecting quote process', async () => {
        const onQuoteResult = jest.fn(() => {
          throw new Error('Callback error')
        })

        // Mock console.warn to capture the warning
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider'],
          options: {
            onQuoteResult,
          },
        })

        // Quote should still succeed despite callback error
        expect(results).toHaveLength(1)
        expect(results[0]?.quote).toBeTruthy()
        expect(results[0]?.error).toBeUndefined()

        // Should have logged the callback error
        expect(consoleSpy).toHaveBeenCalledWith('Error in onQuoteResult callback:', expect.any(Error))

        consoleSpy.mockRestore()
      })

      it('should respect timeout option', async () => {
        // Make first provider fast, second provider slow
        mockProvider.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10)) // 10ms delay - fast
          return bridgeQuoteResult
        })

        mockProvider2.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 200)) // 200ms delay - slow
          return bridgeQuoteResult
        })

        const onQuoteResult = jest.fn()
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        const startTime = Date.now()
        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
          options: {
            onQuoteResult,
            totalTimeout: 100, // 100ms timeout
          },
        })
        const elapsed = Date.now() - startTime

        // Should complete close to timeout time
        expect(elapsed).toBeGreaterThan(90) // At least close to timeout
        expect(elapsed).toBeLessThan(300) // But not wait for slow provider

        // Should still return results for both providers
        expect(results).toHaveLength(2)

        // Find results by provider ID since order may vary
        const mockProviderResult = results.find((r) => r.providerDappId === 'mockProvider')
        const mock2ProviderResult = results.find((r) => r.providerDappId === 'cow-sdk://bridging/providers/mock2')

        // First provider (fast) should succeed
        expect(mockProviderResult).toBeDefined()
        expect(mockProviderResult?.quote).toBeTruthy()

        // Second provider should be defined but might have timed out
        expect(mock2ProviderResult).toBeDefined()
        // Note: We don't assert on quote success for the slow provider as it may timeout

        // Should log timeout warning
        expect(consoleSpy).toHaveBeenCalledWith('getMultiQuotes timeout occurred, returning partial results')

        consoleSpy.mockRestore()
      })

      it('should call progressive callbacks in order of completion, not provider order', async () => {
        const callbackOrder: string[] = []
        const onQuoteResult = jest.fn((result: MultiQuoteResult) => {
          callbackOrder.push(result.providerDappId)
        })

        // Make first provider slower than second
        mockProvider.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100)) // 100ms delay
          return bridgeQuoteResult
        })

        mockProvider2.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 50)) // 50ms delay
          return bridgeQuoteResult
        })

        await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
          options: {
            onQuoteResult,
          },
        })

        // Second provider should complete first due to shorter delay
        expect(callbackOrder).toHaveLength(2)
        expect(callbackOrder[0]).toBe('cow-sdk://bridging/providers/mock2')
        expect(callbackOrder[1]).toBe('mockProvider')
      })

      it('should include errors in progressive callbacks', async () => {
        const progressiveResults: MultiQuoteResult[] = []
        const onQuoteResult = jest.fn((result: MultiQuoteResult) => {
          progressiveResults.push(result)
        })

        // Make one provider fail
        const testError = new Error('Provider failed')
        mockProvider2.getQuote = jest.fn().mockRejectedValue(testError)

        await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
          options: {
            onQuoteResult,
          },
        })

        expect(progressiveResults).toHaveLength(2)

        // First provider should succeed
        const successResult = progressiveResults.find((r) => r.providerDappId === 'mockProvider')
        expect(successResult?.quote).toBeTruthy()
        expect(successResult?.error).toBeUndefined()

        // Second provider should fail
        const errorResult = progressiveResults.find((r) => r.providerDappId === 'cow-sdk://bridging/providers/mock2')
        expect(errorResult?.quote).toBeNull()
        expect(errorResult?.error).toBeTruthy()
        expect(errorResult?.error?.message).toContain('Provider failed')
      })

      it('should work without options (backward compatibility)', async () => {
        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
        })

        expect(results).toHaveLength(3)
        results.forEach((result) => {
          expect(result.quote).toBeTruthy()
          expect(result.error).toBeUndefined()
        })
      })

      it('should use default timeout when not specified', async () => {
        // This test ensures the default timeout (30s) is used
        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          options: {
            onQuoteResult: jest.fn(),
            // No timeout specified - should use default 30000ms
          },
        })

        expect(results).toHaveLength(3)
      })

      it('should respect individual provider timeout', async () => {
        // Create a fast provider that takes 10ms
        const fastProvider = new MockBridgeProvider()
        fastProvider.info.dappId = 'fastProvider'
        fastProvider.info.name = 'Fast Provider'
        fastProvider.getQuote = jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(bridgeQuoteResult), 10)))
        fastProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        fastProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        // Create a slow provider that takes 200ms
        const slowProvider = new MockBridgeProvider()
        slowProvider.info.dappId = 'slowProvider'
        slowProvider.info.name = 'Slow Provider'
        slowProvider.getQuote = jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(bridgeQuoteResult), 200)))
        slowProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        slowProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        // Create SDK with fast and slow providers
        const testSdk = new BridgingSdk({
          providers: [fastProvider, slowProvider],
          tradingSdk,
        })

        const progressiveResults: MultiQuoteResult[] = []
        const onQuoteResult = jest.fn((result) => {
          progressiveResults.push(result)
        })

        const results = await testSdk.getMultiQuotes({
          quoteBridgeRequest,
          options: {
            onQuoteResult,
            providerTimeout: 100, // 100ms - should timeout the slow provider
          },
        })

        expect(results).toHaveLength(2)

        // Fast provider should succeed
        const fastResult = results.find((r) => r.providerDappId === 'fastProvider')
        expect(fastResult?.quote).toBeTruthy()
        expect(fastResult?.error).toBeUndefined()

        // Slow provider should timeout
        const slowResult = results.find((r) => r.providerDappId === 'slowProvider')
        expect(slowResult?.quote).toBeNull()
        expect(slowResult?.error).toBeTruthy()
        expect(slowResult?.error?.message).toContain('Provider slowProvider timeout after 100ms')
      })

      it('should use default provider timeout when not specified', async () => {
        // Default provider timeout should be 15000ms
        const results = await bridgingSdk.getMultiQuotes({
          quoteBridgeRequest,
          options: {
            // No providerTimeout specified - should use default 15000ms
          },
        })

        expect(results).toHaveLength(3)
        results.forEach((result) => {
          expect(result.quote).toBeTruthy()
          expect(result.error).toBeUndefined()
        })
      })

      it('should handle different provider and global timeouts independently', async () => {
        // Create providers with different speeds
        const fastProvider = new MockBridgeProvider()
        fastProvider.info.dappId = 'fastProvider'
        fastProvider.info.name = 'Fast Provider'
        fastProvider.getQuote = jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(bridgeQuoteResult), 50)))
        fastProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        fastProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        const mediumProvider = new MockBridgeProvider()
        mediumProvider.info.dappId = 'mediumProvider'
        mediumProvider.info.name = 'Medium Provider'
        mediumProvider.getQuote = jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(bridgeQuoteResult), 150)))
        mediumProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        mediumProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        const testSdk = new BridgingSdk({
          providers: [fastProvider, mediumProvider],
          tradingSdk,
        })

        const results = await testSdk.getMultiQuotes({
          quoteBridgeRequest,
          options: {
            totalTimeout: 5000, // 5 seconds global timeout
            providerTimeout: 100, // 100ms per provider timeout
          },
        })

        expect(results).toHaveLength(2)

        // Fast provider should succeed (50ms < 100ms timeout)
        const fastResult = results.find((r) => r.providerDappId === 'fastProvider')
        expect(fastResult?.quote).toBeTruthy()
        expect(fastResult?.error).toBeUndefined()

        // Medium provider should timeout (150ms > 100ms timeout)
        const mediumResult = results.find((r) => r.providerDappId === 'mediumProvider')
        expect(mediumResult?.quote).toBeNull()
        expect(mediumResult?.error).toBeTruthy()
        expect(mediumResult?.error?.message).toContain('Provider mediumProvider timeout after 100ms')
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
        })
      })

      it('should return the best quote from all providers', async () => {
        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
        })

        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')
        expect(result?.quote).toBeTruthy()
        expect(result?.error).toBeUndefined()

        // Verify it's actually the best quote (60 ETH)
        expect(result?.quote?.bridge.amountsAndCosts.afterSlippage.buyAmount).toBe(BigInt('60000000000000000000'))
      })

      it('should return specific provider quote when only that provider is requested', async () => {
        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
          providerDappIds: ['mockProvider'],
        })

        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('mockProvider')
        expect(result?.quote).toBeTruthy()

        // Verify only the requested provider was called
        expect(mockProvider.getQuote).toHaveBeenCalled()
        expect(mockProvider2.getQuote).not.toHaveBeenCalled()
        expect(mockProvider3.getQuote).not.toHaveBeenCalled()
      })

      it('should call onQuoteResult callback only when better quotes are found', async () => {
        const progressiveResults: MultiQuoteResult[] = []
        const onQuoteResult = jest.fn((result: MultiQuoteResult) => {
          progressiveResults.push(result)
        })

        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
          options: { onQuoteResult },
        })

        // Should have received callbacks for better quotes only
        // At minimum, we should get the best quote callback
        expect(onQuoteResult).toHaveBeenCalled()
        expect(progressiveResults.length).toBeGreaterThan(0)

        // Final result should be the best available quote (mock3 with 60 ETH)
        expect(result?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')
        expect(result?.quote?.bridge.amountsAndCosts.afterSlippage.buyAmount).toBe(BigInt('60000000000000000000'))

        // Verify all progressive results were improvements
        let lastBuyAmount = BigInt(0)
        for (const progressiveResult of progressiveResults) {
          if (progressiveResult.quote) {
            const currentBuyAmount = progressiveResult.quote.bridge.amountsAndCosts.afterSlippage.buyAmount
            expect(currentBuyAmount).toBeGreaterThan(lastBuyAmount)
            lastBuyAmount = currentBuyAmount
          }
        }
      })

      it('should return first provider error when all providers fail', async () => {
        const error1 = new Error('Provider 1 failed')
        const error2 = new Error('Provider 2 failed')
        const error3 = new Error('Provider 3 failed')

        mockProvider.getQuote = jest.fn().mockRejectedValue(error1)
        mockProvider2.getQuote = jest.fn().mockRejectedValue(error2)
        mockProvider3.getQuote = jest.fn().mockRejectedValue(error3)

        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
        })

        expect(result).toBeTruthy()
        expect(result?.quote).toBeNull()
        expect(result?.error).toBeTruthy()
        // Should return first provider's error (order is not guaranteed due to async)
        expect(['mockProvider', 'cow-sdk://bridging/providers/mock2', 'cow-sdk://bridging/providers/mock3'])
          .toContain(result?.providerDappId)
      })

      it('should return best available quote even when some providers fail', async () => {
        const error = new Error('Provider failed')
        mockProvider.getQuote = jest.fn().mockRejectedValue(error) // Fails
        mockProvider2.getQuote = jest.fn().mockRejectedValue(error) // Fails
        // mockProvider3 succeeds with 1.1 ETH

        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
        })

        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')
        expect(result?.quote).toBeTruthy()
      })

      it('should throw error for same-chain requests', async () => {
        const sameChainRequest = {
          ...quoteBridgeRequest,
          buyTokenChainId: quoteBridgeRequest.sellTokenChainId,
        }

        await expect(
          bridgingSdk.getBestQuote({
            quoteBridgeRequest: sameChainRequest,
          }),
        ).rejects.toThrow('getMultiQuotes() and getBestQuote() are only for cross-chain bridging')
      })

      it('should handle callback errors gracefully without affecting quote process', async () => {
        const onQuoteResult = jest.fn(() => {
          throw new Error('Callback error')
        })

        // Mock console.warn to capture the warning
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
          options: { onQuoteResult },
        })

        // Quote should still succeed despite callback error
        expect(result).toBeTruthy()
        expect(result?.quote).toBeTruthy()

        // Should have logged callback error warning
        expect(consoleSpy).toHaveBeenCalledWith('Error in onQuoteResult callback:', expect.any(Error))

        consoleSpy.mockRestore()
      })

      it('should respect timeout options', async () => {
        // Make one provider fast, others slow (will timeout)
        mockProvider.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10)) // 10ms delay - fast
          return {
            ...bridgeQuoteResult,
            amountsAndCosts: {
              ...bridgeQuoteResult.amountsAndCosts,
              afterSlippage: {
                ...bridgeQuoteResult.amountsAndCosts.afterSlippage,
                buyAmount: BigInt('50000000000000000000'), // 50 ETH
              },
            },
          }
        })

        mockProvider2.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 200)) // 200ms delay - slow
          return {
            ...bridgeQuoteResult,
            amountsAndCosts: {
              ...bridgeQuoteResult.amountsAndCosts,
              afterSlippage: {
                ...bridgeQuoteResult.amountsAndCosts.afterSlippage,
                buyAmount: BigInt('40000000000000000000'), // 40 ETH
              },
            },
          }
        })

        mockProvider3.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 200)) // 200ms delay - slow
          return {
            ...bridgeQuoteResult,
            amountsAndCosts: {
              ...bridgeQuoteResult.amountsAndCosts,
              afterSlippage: {
                ...bridgeQuoteResult.amountsAndCosts.afterSlippage,
                buyAmount: BigInt('60000000000000000000'), // 60 ETH
              },
            },
          }
        })

        const startTime = Date.now()
        const result = await bridgingSdk.getBestQuote({
          quoteBridgeRequest,
          options: {
            totalTimeout: 100,
            providerTimeout: 50,
          },
        })
        const elapsed = Date.now() - startTime

        // Should complete around timeout time or earlier
        expect(elapsed).toBeLessThan(150) // Should not wait for slow providers

        // Should still return the quote from the fast provider
        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('mockProvider')
      })
    })
  })
})
