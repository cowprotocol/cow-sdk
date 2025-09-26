import { MultiQuoteStrategyImpl } from './MultiQuoteStrategy'
import { MockBridgeProvider } from '../../providers/mock/MockBridgeProvider'
import { MultiQuoteResult } from '../../types'
import { assertIsBridgeQuoteAndPost } from '../../utils'
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
} from '../mock/bridgeRequestMocks'
import { QuoteResultsWithSigner, SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { BridgingSdkConfig } from '../BridgingSdk'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../../tests/setup'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe.skip(`MultiQuoteStrategy with ${adapterName}`, () => {
    let strategy: MultiQuoteStrategyImpl
    let config: BridgingSdkConfig
    let tradingSdk: TradingSdk
    let orderBookApi: OrderBookApi
    let quoteResult: QuoteResultsWithSigner

    const mockProvider = new MockBridgeProvider()
    let mockProvider2: MockBridgeProvider
    let mockProvider3: MockBridgeProvider

    beforeEach(() => {
      strategy = new MultiQuoteStrategyImpl()
      jest.clearAllMocks()

      const adapter = adapters[adapterName]
      setGlobalAdapter(adapter)

      const signer = getMockSigner(adapter)
      quoteBridgeRequest.signer = signer

      // Setup main mock provider
      mockProvider.getQuote = jest.fn().mockResolvedValue(bridgeQuoteResult)
      mockProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
      mockProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

      // Setup additional mock providers
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

      config = {
        providers: [mockProvider, mockProvider2, mockProvider3],
        tradingSdk,
        orderBookApi,
      }
    })

    describe('execute', () => {
      it('should get quotes from all providers when no specific providers requested', async () => {
        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: undefined,
        }

        const results = await strategy.execute(request, config)

        expect(results).toHaveLength(3)
        expect(results[0]?.providerDappId).toBe('mockProvider')
        expect(results[1]?.providerDappId).toBe('cow-sdk://bridging/providers/mock2')
        expect(results[2]?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')

        // All should be successful
        results.forEach((result) => {
          expect(result.quote).toBeTruthy()
          expect(result.error).toBeUndefined()
        })

        // Verify all providers were called
        expect(mockProvider.getQuote).toHaveBeenCalled()
        expect(mockProvider2.getQuote).toHaveBeenCalled()
        expect(mockProvider3.getQuote).toHaveBeenCalled()
      })

      it('should get quotes from specific providers when requested', async () => {
        const request = {
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock3'],
          advancedSettings: undefined,
          options: undefined,
        }

        const results = await strategy.execute(request, config)

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

        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: undefined,
        }

        const results = await strategy.execute(request, config)

        expect(results).toHaveLength(3)

        // Results should be sorted with successful quotes first
        const successfulResults = results.filter((r) => r.quote)
        const failedResults = results.filter((r) => !r.quote)

        expect(successfulResults).toHaveLength(2)
        expect(failedResults).toHaveLength(1)

        // Successful providers (order may vary within successful group)
        const successfulProviderIds = successfulResults.map((r) => r.providerDappId)
        expect(successfulProviderIds).toContain('mockProvider')
        expect(successfulProviderIds).toContain('cow-sdk://bridging/providers/mock3')

        // Failed provider should be in the results
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

        const request = {
          quoteBridgeRequest: sameChainRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: undefined,
        }

        await expect(strategy.execute(request, config)).rejects.toThrow(
          'getMultiQuotes() and getBestQuote() are only for cross-chain bridging. For single-chain swaps, use getQuote() instead.',
        )
      })

      it('should throw error for unknown provider dappId', async () => {
        const request = {
          quoteBridgeRequest,
          providerDappIds: ['unknown-provider'],
          advancedSettings: undefined,
          options: undefined,
        }

        await expect(strategy.execute(request, config)).rejects.toThrow(
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

        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings,
          options: undefined,
        }

        await strategy.execute(request, config)

        // Verify advanced settings were passed through
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
        jest.useFakeTimers()

        let provider1Called = false
        let provider2Called = false
        let provider1Resolved = false
        let provider2Resolved = false

        mockProvider.getQuote = jest.fn().mockImplementation(async () => {
          provider1Called = true
          await new Promise((resolve) => setTimeout(() => {
            provider1Resolved = true
            resolve(bridgeQuoteResult)
          }, 100))
          return bridgeQuoteResult
        })

        mockProvider2.getQuote = jest.fn().mockImplementation(async () => {
          provider2Called = true
          await new Promise((resolve) => setTimeout(() => {
            provider2Resolved = true
            resolve(bridgeQuoteResult)
          }, 100))
          return bridgeQuoteResult
        })

        const request = {
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
          advancedSettings: undefined,
          options: undefined,
        }

        const executePromise = strategy.execute(request, config)

        // Verify both providers are called immediately (parallel start)
        await jest.advanceTimersByTimeAsync(0) // Allow microtasks to run
        expect(provider1Called).toBe(true)
        expect(provider2Called).toBe(true)
        expect(provider1Resolved).toBe(false)
        expect(provider2Resolved).toBe(false)

        // Advance time by 100ms to complete both providers
        await jest.advanceTimersByTimeAsync(100)

        const results = await executePromise

        // Verify both providers completed successfully
        expect(results).toHaveLength(2)
        expect(provider1Resolved).toBe(true)
        expect(provider2Resolved).toBe(true)
        expect(mockProvider.getQuote).toHaveBeenCalled()
        expect(mockProvider2.getQuote).toHaveBeenCalled()

        jest.useRealTimers()
      })

      it('should return quotes with correct structure', async () => {
        const request = {
          quoteBridgeRequest,
          providerDappIds: ['mockProvider'],
          advancedSettings: undefined,
          options: undefined,
        }

        const results = await strategy.execute(request, config)

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

        const request = {
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
          advancedSettings: undefined,
          options: {
            onQuoteResult,
          },
        }

        const results = await strategy.execute(request, config)

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

        const request = {
          quoteBridgeRequest,
          providerDappIds: ['mockProvider'],
          advancedSettings: undefined,
          options: {
            onQuoteResult,
          },
        }

        const results = await strategy.execute(request, config)

        // Quote should still succeed despite callback error
        expect(results).toHaveLength(1)
        expect(results[0]?.quote).toBeTruthy()
        expect(results[0]?.error).toBeUndefined()

        // Should have logged the callback error
        expect(consoleSpy).toHaveBeenCalledWith('Error in onQuoteResult callback:', expect.any(Error))

        consoleSpy.mockRestore()
      })

      it('should respect timeout option', async () => {
        jest.useFakeTimers()

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

        const request = {
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
          advancedSettings: undefined,
          options: {
            onQuoteResult,
            totalTimeout: 100, // 100ms timeout
          },
        }

        const executePromise = strategy.execute(request, config)

        // Advance time to complete fast provider (10ms)
        await jest.advanceTimersByTimeAsync(10)

        // Fast provider should complete, callback should be called once
        expect(onQuoteResult).toHaveBeenCalledTimes(1)

        // Advance time to reach timeout (total 100ms)
        await jest.advanceTimersByTimeAsync(90)

        const results = await executePromise

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

        // Should log timeout warning
        expect(consoleSpy).toHaveBeenCalledWith('getMultiQuotes timeout occurred, returning partial results')

        consoleSpy.mockRestore()
        jest.useRealTimers()
      })

      it('should call progressive callbacks in order of completion, not provider order', async () => {
        jest.useFakeTimers()

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

        const request = {
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
          advancedSettings: undefined,
          options: {
            onQuoteResult,
          },
        }

        const executePromise = strategy.execute(request, config)

        // Advance time to complete second provider first (50ms)
        await jest.advanceTimersByTimeAsync(50)
        expect(callbackOrder).toHaveLength(1)
        expect(callbackOrder[0]).toBe('cow-sdk://bridging/providers/mock2')

        // Advance time to complete first provider (total 100ms)
        await jest.advanceTimersByTimeAsync(50)

        await executePromise

        // Second provider should complete first due to shorter delay
        expect(callbackOrder).toHaveLength(2)
        expect(callbackOrder[0]).toBe('cow-sdk://bridging/providers/mock2')
        expect(callbackOrder[1]).toBe('mockProvider')

        jest.useRealTimers()
      })

      it('should include errors in progressive callbacks', async () => {
        const progressiveResults: MultiQuoteResult[] = []
        const onQuoteResult = jest.fn((result: MultiQuoteResult) => {
          progressiveResults.push(result)
        })

        // Make one provider fail
        const testError = new Error('Provider failed')
        mockProvider2.getQuote = jest.fn().mockRejectedValue(testError)

        const request = {
          quoteBridgeRequest,
          providerDappIds: ['mockProvider', 'cow-sdk://bridging/providers/mock2'],
          advancedSettings: undefined,
          options: {
            onQuoteResult,
          },
        }

        await strategy.execute(request, config)

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
        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: undefined,
        }

        const results = await strategy.execute(request, config)

        expect(results).toHaveLength(3)
        results.forEach((result) => {
          expect(result.quote).toBeTruthy()
          expect(result.error).toBeUndefined()
        })
      })

      it('should use default timeout when not specified', async () => {
        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: {
            onQuoteResult: jest.fn(),
            // No timeout specified - should use default 40000ms
          },
        }

        const results = await strategy.execute(request, config)

        expect(results).toHaveLength(3)
      })

      it('should respect individual provider timeout', async () => {
        jest.useFakeTimers()

        // Create providers with different speeds
        const fastProvider = new MockBridgeProvider()
        fastProvider.info.dappId = 'fastProvider'
        fastProvider.getQuote = jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(bridgeQuoteResult), 10)))
        fastProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        fastProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        const slowProvider = new MockBridgeProvider()
        slowProvider.info.dappId = 'slowProvider'
        slowProvider.getQuote = jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(bridgeQuoteResult), 200)))
        slowProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
        slowProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

        const testConfig: BridgingSdkConfig = {
          ...config,
          providers: [fastProvider, slowProvider],
        }

        const progressiveResults: MultiQuoteResult[] = []
        const onQuoteResult = jest.fn((result) => {
          progressiveResults.push(result)
        })

        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: {
            onQuoteResult,
            providerTimeout: 100, // 100ms - should timeout the slow provider
          },
        }

        const executePromise = strategy.execute(request, testConfig)

        // Advance time to complete fast provider (10ms)
        await jest.advanceTimersByTimeAsync(10)
        expect(progressiveResults).toHaveLength(1)
        expect(progressiveResults[0]?.providerDappId).toBe('fastProvider')

        // Advance time to reach provider timeout (100ms)
        await jest.advanceTimersByTimeAsync(90)

        const results = await executePromise

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

        jest.useRealTimers()
      })

      it('should use default provider timeout when not specified', async () => {
        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: {
            // No providerTimeout specified - should use default 20000ms
          },
        }

        const results = await strategy.execute(request, config)

        expect(results).toHaveLength(3)
        results.forEach((result) => {
          expect(result.quote).toBeTruthy()
          expect(result.error).toBeUndefined()
        })
      })
    })

    describe('strategyName', () => {
      it('should have the correct strategy name', () => {
        expect(strategy.strategyName).toBe('MultiQuoteStrategy')
      })
    })
  })
})
