import { SingleQuoteStrategy } from './SingleQuoteStrategy'
import { MockHookBridgeProvider } from '../../providers/mock/HookMockBridgeProvider'
import { QuoteBridgeRequest } from '../../types'
import { assertIsBridgeQuoteAndPost, assertIsQuoteAndPost } from '../../utils'
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
} from '../mock/bridgeRequestMocks'
import {
  QuoteAndPost,
  QuoteResultsWithSigner,
  SwapAdvancedSettings,
  TradeParameters,
  TradingSdk,
  WithPartialTraderParams,
} from '@cowprotocol/sdk-trading'
import { OrderBookApi, SigningScheme } from '@cowprotocol/sdk-order-book'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { BridgingSdkConfig } from '../types'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../../tests/setup'
import { expectToEqual } from '../../test'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe(`SingleQuoteStrategy with ${adapterName}`, () => {
    let strategy: SingleQuoteStrategy
    let config: BridgingSdkConfig
    let tradingSdk: TradingSdk
    let orderBookApi: OrderBookApi
    let quoteResult: QuoteResultsWithSigner

    const mockProvider = new MockHookBridgeProvider()
    mockProvider.getQuote = jest.fn().mockResolvedValue(bridgeQuoteResult)
    mockProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
    mockProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

    beforeEach(() => {
      strategy = new SingleQuoteStrategy()
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

      config = {
        providers: [mockProvider],
        tradingSdk,
        orderBookApi,
      }
    })

    describe('execute', () => {
      it('should handle cross-chain swap', async () => {
        const request = {
          quoteBridgeRequest,
          advancedSettings: undefined,
        }

        const quote = await strategy.execute(request, config.tradingSdk, config.providers)

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
        expectToEqual(bridge.providerInfo, new MockHookBridgeProvider().info)
        expectToEqual(bridge.quoteTimestamp, bridgeQuoteTimestamp)
        expectToEqual(bridge.expectedFillTimeSeconds, bridgeExpectedFillTimeSeconds)

        expect(bridge.isSell).toEqual(true)
        expectToEqual(bridge.tradeParameters, {
          ...quoteBridgeRequest,
          sellTokenAddress: intermediateToken,
          sellTokenDecimals: intermediateTokenDecimals,
          amount: (100n * 10n ** BigInt(intermediateTokenDecimals)).toString(),
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
        if (bridge.bridgeCallDetails) {
          expectToEqual(bridge.bridgeCallDetails.preAuthorizedBridgingHook, bridgeCallDetails.preAuthorizedBridgingHook)
          expectToEqual(bridge.bridgeCallDetails.unsignedBridgeCall, bridgeCallDetails.unsignedBridgeCall)
        } else {
          fail('bridgeCallDetails should be defined (bridge provider uses hooks)')
        }
      })

      it('should handle single-chain swap', async () => {
        const mainnetDai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
        const mainnetDaiDecimals = 18

        const singleChainRequest: QuoteBridgeRequest = {
          ...quoteBridgeRequest,
          buyTokenChainId: SupportedChainId.MAINNET,
          buyTokenAddress: mainnetDai,
          buyTokenDecimals: mainnetDaiDecimals,
        }

        const { sellTokenAddress, buyTokenAddress, amount, ...rest } = singleChainRequest
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

        const request = {
          quoteBridgeRequest: singleChainRequest,
          advancedSettings: undefined,
        }

        const quote = await strategy.execute(request, config.tradingSdk, config.providers)

        // We get a single-chain quote
        assertIsQuoteAndPost(quote)
        const { quoteResults, postSwapOrderFromQuote } = quote

        // Verify the strategy delegates to the trading sdk
        expect(tradingSdk.getQuote).toHaveBeenCalledWith(tradeParameters, undefined)

        // Verify the results match expected results
        expect(quoteResults.amountsAndCosts).toEqual(amountsAndCosts)
        expect(quoteResults.tradeParameters).toEqual(tradeParameters)
        expect(quoteResults.orderToSign).toEqual(orderToSign)
        expect(quoteResults.quoteResponse).toEqual(orderQuoteResponse)
        expect(quoteResults.appDataInfo).toEqual(appDataInfo)
        expect(quoteResults.orderTypedData).toEqual(orderTypedData)

        // Verify postSwapOrderFromQuote
        expect(postSwapOrderFromQuote).toBeDefined()
      })

      it('should pass advanced settings to cross-chain quotes', async () => {
        const advancedSettings: SwapAdvancedSettings = {
          quoteRequest: {
            validTo: 1758524284,
          },
        }

        const request = {
          quoteBridgeRequest,
          advancedSettings,
        }

        await strategy.execute(request, config.tradingSdk, config.providers)

        // Verify advanced settings were passed through
        expect(tradingSdk.getQuoteResults).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            quoteRequest: expect.objectContaining({
              validTo: 1758524284,
            }),
          }),
        )
      })

      it('should pass advanced settings to single-chain quotes', async () => {
        const singleChainRequest: QuoteBridgeRequest = {
          ...quoteBridgeRequest,
          buyTokenChainId: quoteBridgeRequest.sellTokenChainId,
        }

        const advancedSettings: SwapAdvancedSettings = {
          quoteRequest: {
            validTo: 1758524284,
          },
        }

        const { sellTokenAddress, buyTokenAddress, amount, ...rest } = singleChainRequest
        const tradeParameters: WithPartialTraderParams<TradeParameters> = {
          ...rest,
          sellToken: sellTokenAddress,
          buyToken: buyTokenAddress,
          amount: amount.toString(),
          chainId: singleChainRequest.sellTokenChainId,
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

        const request = {
          quoteBridgeRequest: singleChainRequest,
          advancedSettings,
        }

        await strategy.execute(request, config.tradingSdk, config.providers)

        // Verify advanced settings were passed through
        expect(tradingSdk.getQuote).toHaveBeenCalledWith(tradeParameters, advancedSettings)
      })

      it('should throw error when no provider is available for cross-chain swap', async () => {
        const configWithoutProviders: BridgingSdkConfig = {
          ...config,
          providers: [],
        }

        const request = {
          quoteBridgeRequest,
          advancedSettings: undefined,
        }

        await expect(
          strategy.execute(request, configWithoutProviders.tradingSdk, configWithoutProviders.providers),
        ).rejects.toThrow('No provider found for cross-chain swap')
      })
    })

    describe('strategyName', () => {
      it('should have the correct strategy name', () => {
        expect(strategy.strategyName).toBe('SingleQuoteStrategy')
      })
    })
  })
})
