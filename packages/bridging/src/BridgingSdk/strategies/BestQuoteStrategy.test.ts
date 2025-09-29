import { BestQuoteStrategy } from './BestQuoteStrategy'
import { MockBridgeProvider } from '../../providers/mock/MockBridgeProvider'
import { MultiQuoteResult } from '../../types'
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
import { QuoteResultsWithSigner, TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { BridgingSdkConfig } from '../types'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../../tests/setup'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe.skip(`BestQuoteStrategy with ${adapterName}`, () => {
    let strategy: BestQuoteStrategy
    let config: BridgingSdkConfig
    let tradingSdk: TradingSdk
    let orderBookApi: OrderBookApi
    let quoteResult: QuoteResultsWithSigner

    const mockProvider = new MockBridgeProvider()
    let mockProvider2: MockBridgeProvider
    let mockProvider3: MockBridgeProvider

    beforeEach(async () => {
      strategy = new BestQuoteStrategy()
      jest.clearAllMocks()

      const adapter = adapters[adapterName]
      setGlobalAdapter(adapter)

      const signer = getMockSigner(adapter)
      quoteBridgeRequest.signer = signer

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
      mockProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
      mockProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

      mockProvider2 = new MockBridgeProvider()
      mockProvider2.info.dappId = 'cow-sdk://bridging/providers/mock2'
      mockProvider2.info.name = 'Mock Bridge Provider 2'
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

    describe.skip('execute', () => {
      it('should return the best quote from all providers', async () => {
        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: undefined,
        }

        const result = await strategy.execute(request, config)

        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')
        expect(result?.quote).toBeTruthy()
        expect(result?.error).toBeUndefined()

        // Verify it's actually the best quote (60 ETH)
        expect(result?.quote?.bridge.amountsAndCosts.afterSlippage.buyAmount).toBe(BigInt('60000000000000000000'))
      })

      it('should return specific provider quote when only that provider is requested', async () => {
        const request = {
          quoteBridgeRequest,
          providerDappIds: ['mockProvider'],
          advancedSettings: undefined,
          options: undefined,
        }

        const result = await strategy.execute(request, config)

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

        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: { onQuoteResult },
        }

        const result = await strategy.execute(request, config)

        // Should have received callbacks for better quotes only
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

        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: undefined,
        }

        const result = await strategy.execute(request, config)

        expect(result).toBeTruthy()
        expect(result?.quote).toBeNull()
        expect(result?.error).toBeTruthy()
        // Should return first provider's error (order is not guaranteed due to async)
        expect(['mockProvider', 'cow-sdk://bridging/providers/mock2', 'cow-sdk://bridging/providers/mock3']).toContain(
          result?.providerDappId,
        )
      })

      it('should return best available quote even when some providers fail', async () => {
        const error = new Error('Provider failed')
        mockProvider.getQuote = jest.fn().mockRejectedValue(error) // Fails
        mockProvider2.getQuote = jest.fn().mockRejectedValue(error) // Fails
        // mockProvider3 succeeds with 60 ETH

        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: undefined,
        }

        const result = await strategy.execute(request, config)

        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('cow-sdk://bridging/providers/mock3')
        expect(result?.quote).toBeTruthy()
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
          'getMultiQuotes() and getBestQuote() are only for cross-chain bridging',
        )
      })

      it('should handle callback errors gracefully without affecting quote process', async () => {
        const onQuoteResult = jest.fn(() => {
          throw new Error('Callback error')
        })

        // Mock console.warn to capture the warning
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: { onQuoteResult },
        }

        const result = await strategy.execute(request, config)

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

        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: {
            totalTimeout: 100,
            providerTimeout: 50,
          },
        }

        const startTime = Date.now()
        const result = await strategy.execute(request, config)
        const elapsed = Date.now() - startTime

        // Should complete around timeout time or earlier
        expect(elapsed).toBeLessThan(150) // Should not wait for slow providers

        // Should still return the quote from the fast provider
        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('mockProvider')
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

      it('should use default timeouts when not specified', async () => {
        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: {
            onQuoteResult: jest.fn(),
            // No timeouts specified - should use defaults (40s total, 20s per provider)
          },
        }

        const result = await strategy.execute(request, config)

        expect(result).toBeTruthy()
        expect(result?.quote).toBeTruthy()
      })

      it('should handle mixed provider speeds correctly', async () => {
        // Fast provider with good quote
        mockProvider.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 20)) // 20ms delay
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

        // Medium speed provider with better quote
        mockProvider2.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 80)) // 80ms delay
          return {
            ...bridgeQuoteResult,
            amountsAndCosts: {
              ...bridgeQuoteResult.amountsAndCosts,
              afterSlippage: {
                ...bridgeQuoteResult.amountsAndCosts.afterSlippage,
                buyAmount: BigInt('70000000000000000000'), // 70 ETH - best quote
              },
            },
          }
        })

        // Slow provider that will timeout
        mockProvider3.getQuote = jest.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 200)) // 200ms delay
          return {
            ...bridgeQuoteResult,
            amountsAndCosts: {
              ...bridgeQuoteResult.amountsAndCosts,
              afterSlippage: {
                ...bridgeQuoteResult.amountsAndCosts.afterSlippage,
                buyAmount: BigInt('80000000000000000000'), // 80 ETH
              },
            },
          }
        })

        const progressiveResults: MultiQuoteResult[] = []
        const onQuoteResult = jest.fn((result: MultiQuoteResult) => {
          progressiveResults.push(result)
        })

        const request = {
          quoteBridgeRequest,
          providerDappIds: undefined,
          advancedSettings: undefined,
          options: {
            onQuoteResult,
            totalTimeout: 150, // 150ms total timeout
            providerTimeout: 100, // 100ms per provider timeout
          },
        }

        const result = await strategy.execute(request, config)

        // Should get the best available quote from completed providers (mock2 with 70 ETH)
        expect(result).toBeTruthy()
        expect(result?.providerDappId).toBe('cow-sdk://bridging/providers/mock2')
        expect(result?.quote?.bridge.amountsAndCosts.afterSlippage.buyAmount).toBe(BigInt('70000000000000000000'))

        // Should have received progressive callbacks in order of completion
        expect(progressiveResults.length).toBeGreaterThanOrEqual(1)

        // First callback should be from fast provider (mockProvider with 50 ETH)
        expect(progressiveResults[0]?.providerDappId).toBe('mockProvider')
        expect(progressiveResults[0]?.quote?.bridge.amountsAndCosts.afterSlippage.buyAmount).toBe(
          BigInt('50000000000000000000'),
        )

        // If we received a second callback, it should be the better quote from mock2
        if (progressiveResults.length > 1) {
          expect(progressiveResults[1]?.providerDappId).toBe('cow-sdk://bridging/providers/mock2')
          expect(progressiveResults[1]?.quote?.bridge.amountsAndCosts.afterSlippage.buyAmount).toBe(
            BigInt('70000000000000000000'),
          )
        }
      })
    })

    describe.skip('strategyName', () => {
      it('should have the correct strategy name', () => {
        expect(strategy.strategyName).toBe('BestQuoteStrategy')
      })
    })
  })
})
