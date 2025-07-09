import {
  ALL_SUPPORTED_CHAINS,
  SupportedChainId,
  TargetChainId,
  mainnet,
  optimism,
  sepolia,
} from '@cowprotocol/sdk-config'
import { BridgingSdk } from './BridgingSdk'
import { MockBridgeProvider } from '../providers/mock/MockBridgeProvider'
import { QuoteAndPost, TradeParameters, TradingSdk, WithPartialTraderParams } from '@cowprotocol/sdk-trading'
import { QuoteBridgeRequest } from '../types'
import { OrderBookApi, SigningScheme } from '@cowprotocol/sdk-order-book'
import { QuoteResultsWithSigner } from '@cowprotocol/sdk-trading/src/getQuote'
import { assertIsBridgeQuoteAndPost, assertIsQuoteAndPost } from '../utils'
import { expectToEqual, setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  amountsAndCosts,
  appDataInfo,
  bridgeCallDetails,
  bridgeExpectedFillTimeSeconds,
  bridgeQuoteResult,
  bridgeQuoteTimestamp,
  intermediateToken,
  intermediateTokenDecimals,
  orderQuoteResponse,
  orderToSign,
  orderTypedData,
  quoteBridgeRequest,
  tradeParameters,
  getMockSigner,
} from './mock/bridgeRequestMocks'
import { createAdapters } from '../../tests/setup'

describe('BridgingSdk', () => {
  let bridgingSdk: BridgingSdk
  let tradingSdk: TradingSdk
  let orderBookApi: OrderBookApi
  let quoteResult: QuoteResultsWithSigner

  const mockProvider = new MockBridgeProvider()
  mockProvider.getQuote = jest.fn().mockResolvedValue(bridgeQuoteResult)
  mockProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
  mockProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

  const adapters = createAdapters()
  const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
  adapterNames.forEach((adapterName) => {
    describe(`with ${adapterName}`, () => {
      beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)

        quoteBridgeRequest.signer = getMockSigner(adapter)

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
            signer: getMockSigner(adapter),
            suggestedSlippageBps: 50,
          },
        }
        tradingSdk.getQuoteResults = jest.fn().mockResolvedValue(quoteResult)

        bridgingSdk = new BridgingSdk({
          providers: [mockProvider],
          getErc20Decimals: async (_: TargetChainId, tokenAddress: string) => {
            if (tokenAddress !== intermediateToken) {
              throw new Error('This mock its supposed to be used for intermediate token')
            }

            return intermediateTokenDecimals
          },
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
            amount: BigInt('100000000000000000000').toString(),
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
              suggestedSlippageBps: 50,
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
    })
  })
})
