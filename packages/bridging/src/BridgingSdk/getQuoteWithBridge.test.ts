import { getEthFlowContract, TradingSdk } from '@cowprotocol/sdk-trading'
import { MockHookBridgeProvider } from '../providers/mock/HookMockBridgeProvider'
import { MockReceiverAccountBridgeProvider } from '../providers/mock/ReceiverAccountMockBridgeProvider'
import { QuoteBridgeRequest } from '../types'
import { getQuoteWithBridge } from './getQuoteWithBridge'
import {
  bridgeCallDetails,
  bridgeQuoteResult,
  cowShedForAccount,
  getMockSigner,
  intermediateToken,
  orderQuoteResponse,
  quoteBridgeRequest,
} from './mock/bridgeRequestMocks'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { NATIVE_CURRENCY_ADDRESS, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { getHookMockForCostEstimation } from '../hooks/utils'
import { createAdapters } from '../../tests/setup'
import { AbstractSigner, setGlobalAdapter, Provider, TTLCache } from '@cowprotocol/sdk-common'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'
import { GetQuoteWithBridgeParams } from './types'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe(`getQuoteWithBridge with ${adapterName}`, () => {
    let tradingSdk: TradingSdk
    let orderBookApi: OrderBookApi
    let mockProvider: MockHookBridgeProvider

    let getQuoteMock: jest.Mock
    let getUnsignedBridgeCallMock: jest.Mock
    let sendOrderMock: jest.Mock
    let signerMock: AbstractSigner<Provider>

    const mockIntermediateTokens = [
      { address: '0x123', name: 'Token1', symbol: 'TK1', decimals: 18, chainId: 137 },
      { address: '0x456', name: 'Token2', symbol: 'TK2', decimals: 6, chainId: 137 },
    ]

    beforeEach(() => {
      const adapter = adapters[adapterName]

      setGlobalAdapter(adapter)

      signerMock = getMockSigner(adapter)

      quoteBridgeRequest.signer = signerMock

      jest.clearAllMocks()

      // Clear localStorage for clean test state
      if (typeof localStorage !== 'undefined') {
        localStorage.clear()
      }

      // Mock gas estimation to avoid RPC errors in tests
      const mockEstimateGas = jest.fn().mockResolvedValue(BigInt(200000))
      if (signerMock.estimateGas) {
        signerMock.estimateGas = mockEstimateGas
      }

      mockProvider = new MockHookBridgeProvider()
      mockProvider.getQuote = getQuoteMock = jest.fn().mockResolvedValue(bridgeQuoteResult)
      mockProvider.getUnsignedBridgeCall = getUnsignedBridgeCallMock = jest
        .fn()
        .mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
      mockProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

      sendOrderMock = jest.fn().mockResolvedValue('0x01')
      orderBookApi = {
        context: {
          chainId: SupportedChainId.GNOSIS_CHAIN,
        },
        getQuote: jest.fn().mockResolvedValue(orderQuoteResponse),
        uploadAppData: jest.fn().mockResolvedValue(''),
        sendOrder: sendOrderMock,
      } as unknown as OrderBookApi

      tradingSdk = new TradingSdk({}, { orderBookApi })
    })

    async function postOrder(request: QuoteBridgeRequest) {
      return getQuoteWithBridge(mockProvider, {
        swapAndBridgeRequest: request,
        tradingSdk,
      })
    }

    async function postOrderWithCustomReceiver(customReceiver: string) {
      const { postSwapOrderFromQuote } = await postOrder(quoteBridgeRequest)

      await postSwapOrderFromQuote({
        quoteRequest: {
          receiver: customReceiver,
        },
      })
    }

    async function postOrderWithIntermediateTokensCache(request: GetQuoteWithBridgeParams) {
      return getQuoteWithBridge(mockProvider, {
        swapAndBridgeRequest: request.swapAndBridgeRequest,
        tradingSdk,
        intermediateTokensCache: request.intermediateTokensCache,
      })
    }

    it('When receiver is present in advanced settings, then should add it to the hook', async () => {
      const customReceiver = '0xmyCustomReceiver'

      await postOrderWithCustomReceiver(customReceiver)

      expect(getQuoteMock).toHaveBeenCalledTimes(2)
      // First time quote is called for original receiver
      expect(getQuoteMock.mock.calls[0][0].receiver).toBe(quoteBridgeRequest.receiver)
      // Second time quote is called for custom receiver
      expect(getQuoteMock.mock.calls[1][0].receiver).toBe(customReceiver)

      expect(getUnsignedBridgeCallMock).toHaveBeenCalledTimes(2)
      expect(getUnsignedBridgeCallMock.mock.calls[0][0].receiver).toBe(quoteBridgeRequest.receiver)
      expect(getUnsignedBridgeCallMock.mock.calls[1][0].receiver).toBe(customReceiver)
    })

    it('When receiver is present in advanced settings, then should set proxy account as order receiver', async () => {
      const customReceiver = '0xmyCustomReceiver'

      await postOrderWithCustomReceiver(customReceiver)

      expect(sendOrderMock.mock.calls[0][0].receiver).toBe(cowShedForAccount)
    })

    it('When selling ETH, then should make createOrder transaction', async () => {
      const { postSwapOrderFromQuote } = await postOrder({
        ...quoteBridgeRequest,
        sellTokenAddress: NATIVE_CURRENCY_ADDRESS,
      })

      await postSwapOrderFromQuote()

      const ethFlowContract = getEthFlowContract(signerMock, SupportedChainId.GNOSIS_CHAIN)
      const sendTxCall = (signerMock.sendTransaction as unknown as jest.Mock).mock.calls[0][0]
      const data = ethFlowContract.interface.decodeFunctionData('createOrder', sendTxCall.data)
      const orderParams = data[0] as { buyToken: string; receiver: string }

      expect(orderParams.buyToken).toBe(intermediateToken)
      expect(orderParams.receiver).toEqual(cowShedForAccount)
    })

    it('When there are other bridging post hooks in quite, then should remove them and keep only one', async () => {
      orderBookApi.getQuote = jest.fn().mockResolvedValue({
        ...orderQuoteResponse,
        quote: {
          ...orderQuoteResponse.quote,
          appData: JSON.stringify({
            appCode: 'CoW Swap',
            environment: 'local',
            metadata: {
              hooks: {
                // Add additional bridging hook and mocked hook
                post: [
                  {
                    callData:
                      '0xa8481abe00000000000000000000000000000000000000000000000000000000000000a0d8f50fb2ecb318e8d135240fd2d519e9988f2dedd76d47e38a90fd1af88dc17900000000000000000000000000000000000000000000000000000000686ccd5d000000000000000000000000fb3c7eb936caa12b5a884d612393969a557d430700000000000000000000000000000000000000000000000000000000000008a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000009585c3062df1c247d5e373cfca9167f7dc2b5963000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000006e4de792d5f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000670a082310100ffffffffff00833589fcd6edb6e08f4c7c32d4f71b54bda02913095ea7b3010100ffffffffff833589fcd6edb6e08f4c7c32d4f71b54bda02913ade1209c01820300ffffff8375b6ba5fcab20848ca00f132d253638fea82e598a9cc933f01040005ffffff0075b6ba5fcab20848ca00f132d253638fea82e598ade1209c01830600ffffff8075b6ba5fcab20848ca00f132d253638fea82e5981028c2bd010780ffffffffff3a23f943181408eac424116af7b7790c94cb97a50000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000004a000000000000000000000000000000000000000000000000000000000000004e00000000000000000000000000000000000000000000000000000000000000520000000000000000000000000000000000000000000000000000000000000056000000000000000000000000000000000000000000000000000000000000000200000000000000000000000002bfcacf7ff137289a2c4841ea90413ab5110303200000000000000000000000000000000000000000000000000000000000000200000000000000000000000003a23f943181408eac424116af7b7790c94cb97a500000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000002a0792ebcb900000000000000000000000000000000000000000000000000000000010f00af000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000443e80000000000000000000000000000000000000000000000000000000000000a2d00000000000000000000000000000000000000000000000000000000000000020000000000000000000000002bfcacf7ff137289a2c4841ea90413ab51103032000000000000000000000000fb3c7eb936caa12b5a884d612393969a557d43070000000000000000000000000000000000000000000000000000000000000002000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000010abcc70000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000686cc60300000000000000000000000000000000000000000000000000000000686d1a09d00dfeeddeadbeef765753be7f7a64d5509974b0d678e1e3149b02f400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000010f00af000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000010abcc7000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001e40000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000019b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041bad01c24d4cc4ff955b0759ee688b9670b8e615933f82ee7bd2c10661a9a59237cb6849d9d42a8d1b95355ea51cf6f919ae51ca6870634d3193a304e9dd0c6ec1b00000000000000000000000000000000000000000000000000000000000000',
                    dappId: 'cow-sdk://bridging/providers/bungee',
                    gasLimit: '240000',
                    target: '0x00E989b87700514118Fa55326CD1cCE82faebEF6',
                  },
                  getHookMockForCostEstimation(600_001),
                ],
              },
              orderClass: { orderClass: 'market' },
              quote: { slippageBips: 50, smartSlippage: false },
            },
            version: '1.4.0',
          }),
        },
      })

      const { postSwapOrderFromQuote } = await postOrder({
        ...quoteBridgeRequest,
      })

      await postSwapOrderFromQuote()

      const sendOrderCall = (orderBookApi.sendOrder as unknown as jest.Mock).mock.calls[0][0]
      const orderAppData = JSON.parse(sendOrderCall.appData)

      expect(orderAppData.metadata.hooks.post.length).toBe(1)
      expect(orderAppData.metadata.hooks.post[0]).toEqual(bridgeCallDetails.preAuthorizedBridgingHook.postHook)
    })

    it('should throw error when bridge provider fails to get quote', async () => {
      mockProvider.getQuote = jest.fn().mockRejectedValue(new BridgeProviderQuoteError(BridgeQuoteErrors.QUOTE_ERROR))

      await expect(postOrder(quoteBridgeRequest)).rejects.toThrow(BridgeProviderQuoteError)
    })

    it('should throw error when no intermediate tokens are available', async () => {
      mockProvider.getIntermediateTokens = jest.fn().mockResolvedValue([])

      await expect(postOrder(quoteBridgeRequest)).rejects.toThrow(BridgeProviderQuoteError)
    })

    it('should handle validTo override in advanced settings', async () => {
      const customValidTo = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const { postSwapOrderFromQuote } = await postOrder(quoteBridgeRequest)

      await postSwapOrderFromQuote({
        quoteRequest: {
          validTo: customValidTo,
        },
      })

      expect(getQuoteMock).toHaveBeenCalledTimes(2)
      // Verify the validTo is passed correctly to the bridge request
      expect(getUnsignedBridgeCallMock.mock.calls[1]).toBeDefined()
    })

    it('should cache intermediate tokens if intermediateTokensCache is provided', async () => {
      mockProvider.getIntermediateTokens = jest.fn().mockResolvedValue(mockIntermediateTokens)

      const intermediateTokensTtl = 1000
      const intermediateTokensCache = new TTLCache<TokenInfo[]>('test', true, intermediateTokensTtl)
      // First call
      await postOrderWithIntermediateTokensCache({
        swapAndBridgeRequest: quoteBridgeRequest,
        tradingSdk,
        intermediateTokensCache,
      })

      // Second call immediately - should use cache
      await postOrderWithIntermediateTokensCache({
        swapAndBridgeRequest: quoteBridgeRequest,
        tradingSdk,
        intermediateTokensCache,
      })

      expect(mockProvider.getIntermediateTokens).toHaveBeenCalledTimes(1)
    })

    it('should not cache intermediate tokens if intermediateTokensCache is not provided', async () => {
      mockProvider.getIntermediateTokens = jest.fn().mockResolvedValue(mockIntermediateTokens)

      // First call
      await postOrderWithIntermediateTokensCache({
        swapAndBridgeRequest: quoteBridgeRequest,
        tradingSdk,
      })

      // Second call
      await postOrderWithIntermediateTokensCache({
        swapAndBridgeRequest: quoteBridgeRequest,
        tradingSdk,
      })

      expect(mockProvider.getIntermediateTokens).toHaveBeenCalledTimes(2)
    })

    it('should update app-data with bridge quote details for HookBridgeProvider', async () => {
      const quoteWithIdAndSignature = {
        ...bridgeQuoteResult,
        id: 'hook-quote-id-789',
        signature: '0xhook-signature-789',
      }
      mockProvider.getQuote = jest.fn().mockResolvedValue(quoteWithIdAndSignature)

      const result = await postOrder(quoteBridgeRequest)

      const appData = result.swap.appDataInfo.doc
      expect(appData.metadata.bridging?.quoteId).toBe('hook-quote-id-789')
      expect(appData.metadata.bridging?.quoteSignature).toBe('0xhook-signature-789')
    })

    it('should preserve existing bridging metadata when updating with quote details', async () => {
      const quoteWithIdAndSignature = {
        ...bridgeQuoteResult,
        id: 'preserve-test-id',
        signature: '0xpreserve-signature',
      }
      mockProvider.getQuote = jest.fn().mockResolvedValue(quoteWithIdAndSignature)

      const result = await postOrder(quoteBridgeRequest)

      const appData = result.swap.appDataInfo.doc
      // Should have the new quote details
      expect(appData.metadata.bridging?.quoteId).toBe('preserve-test-id')
      expect(appData.metadata.bridging?.quoteSignature).toBe('0xpreserve-signature')
      // Should preserve existing bridging metadata structure
      expect(appData.metadata.bridging).toBeDefined()
    })
  })
})

describe('createPostSwapOrderFromQuote with ReceiverAccountBridgeProvider', () => {
  const adapters = createAdapters()
  const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

  adapterNames.forEach((adapterName) => {
    describe(`with ${adapterName}`, () => {
      let tradingSdk: TradingSdk
      let orderBookApi: OrderBookApi
      let mockProvider: MockReceiverAccountBridgeProvider
      let signerMock: AbstractSigner<Provider>
      let getQuoteMock: jest.Mock
      let sendOrderMock: jest.Mock
      let uploadAppDataMock: jest.Mock

      beforeEach(() => {
        const adapter = adapters[adapterName]

        setGlobalAdapter(adapter)

        signerMock = getMockSigner(adapter)

        quoteBridgeRequest.signer = signerMock

        jest.clearAllMocks()

        // Clear localStorage for clean test state
        if (typeof localStorage !== 'undefined') {
          localStorage.clear()
        }

        mockProvider = new MockReceiverAccountBridgeProvider()
        mockProvider.getQuote = getQuoteMock = jest.fn().mockResolvedValue(bridgeQuoteResult)

        sendOrderMock = jest.fn().mockResolvedValue('0x01')
        uploadAppDataMock = jest.fn().mockResolvedValue('0xappDataHash123')
        orderBookApi = {
          context: {
            chainId: SupportedChainId.GNOSIS_CHAIN,
          },
          getQuote: jest.fn().mockResolvedValue(orderQuoteResponse),
          uploadAppData: uploadAppDataMock,
          sendOrder: sendOrderMock,
        } as unknown as OrderBookApi

        tradingSdk = new TradingSdk({}, { orderBookApi })
      })

      it('should include bridge quote id and signature in bridge result', async () => {
        const quoteWithIdAndSignature = {
          ...bridgeQuoteResult,
          id: 'test-quote-id-123',
          signature: '0xsignature123',
        }
        mockProvider.getQuote = jest.fn().mockResolvedValue(quoteWithIdAndSignature)

        const result = await getQuoteWithBridge(mockProvider, {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        })

        expect(result.bridge.id).toBe('test-quote-id-123')
        expect(result.bridge.signature).toBe('0xsignature123')
      })

      it('should update app-data with bridge quote details when id and signature are present', async () => {
        const quoteWithIdAndSignature = {
          ...bridgeQuoteResult,
          id: 'test-quote-id-456',
          signature: '0xsignature456',
        }
        mockProvider.getQuote = jest.fn().mockResolvedValue(quoteWithIdAndSignature)

        const result = await getQuoteWithBridge(mockProvider, {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        })

        const appData = result.swap.appDataInfo.doc
        expect(appData.metadata.bridging?.quoteId).toBe('test-quote-id-456')
        expect(appData.metadata.bridging?.quoteSignature).toBe('0xsignature456')
      })

      it('should not update app-data bridging fields when quote has no id or signature', async () => {
        const quoteWithoutIdAndSignature = {
          ...bridgeQuoteResult,
          id: undefined,
          signature: undefined,
        }
        mockProvider.getQuote = jest.fn().mockResolvedValue(quoteWithoutIdAndSignature)

        const result = await getQuoteWithBridge(mockProvider, {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        })

        const appData = result.swap.appDataInfo.doc
        // Should not have quoteId or quoteSignature fields if not present in quote
        expect(appData.metadata.bridging?.quoteId).toBeUndefined()
        expect(appData.metadata.bridging?.quoteSignature).toBeUndefined()
      })

      it('should update app-data with only quote id when signature is not present', async () => {
        const quoteWithIdOnly = {
          ...bridgeQuoteResult,
          id: 'test-quote-id-only',
          signature: undefined,
        }
        mockProvider.getQuote = jest.fn().mockResolvedValue(quoteWithIdOnly)

        const result = await getQuoteWithBridge(mockProvider, {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        })

        const appData = result.swap.appDataInfo.doc
        expect(appData.metadata.bridging?.quoteId).toBe('test-quote-id-only')
        expect(appData.metadata.bridging?.quoteSignature).toBeUndefined()
      })

      it('should update app-data with only signature when id is not present', async () => {
        const quoteWithSignatureOnly = {
          ...bridgeQuoteResult,
          id: undefined,
          signature: '0xsignature-only',
        }
        mockProvider.getQuote = jest.fn().mockResolvedValue(quoteWithSignatureOnly)

        const result = await getQuoteWithBridge(mockProvider, {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        })

        const appData = result.swap.appDataInfo.doc
        expect(appData.metadata.bridging?.quoteId).toBeUndefined()
        expect(appData.metadata.bridging?.quoteSignature).toBe('0xsignature-only')
      })

      it('should override appDataInfo with advancedSettings.appData when provided', async () => {
        const { postSwapOrderFromQuote } = await getQuoteWithBridge(mockProvider, {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        })

        const customAppData = {
          metadata: {
            quote: {
              slippageBips: 100,
            },
            referrer: {
              address: '0x1234567890123456789012345678901234567890',
            },
          },
        }

        await postSwapOrderFromQuote({
          appData: customAppData,
        })

        // Verify that sendOrder was called
        expect(sendOrderMock).toHaveBeenCalledTimes(1)

        // Verify that the order's appData includes the custom metadata
        const sendOrderCall = sendOrderMock.mock.calls[0][0]
        const orderAppData = JSON.parse(sendOrderCall.appData)

        // Should have the custom metadata merged
        expect(orderAppData.metadata.quote.slippageBips).toBe(100)
        expect(orderAppData.metadata.referrer.address).toBe('0x1234567890123456789012345678901234567890')

        // Verify that getQuote was NOT called again (skipQuoteRefetch = true for ReceiverAccountBridgeProvider)
        expect(getQuoteMock).toHaveBeenCalledTimes(1) // Only the initial call
      })

      it('should use initial appDataInfo when no advancedSettings.appData is provided', async () => {
        const { postSwapOrderFromQuote, swap } = await getQuoteWithBridge(mockProvider, {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        })

        const initialAppData = swap.appDataInfo.doc

        await postSwapOrderFromQuote()

        // Verify that sendOrder was called
        expect(sendOrderMock).toHaveBeenCalledTimes(1)

        // Verify that the order's appData matches the initial appData
        const sendOrderCall = sendOrderMock.mock.calls[0][0]
        const orderAppData = JSON.parse(sendOrderCall.appData)

        // Should have the same structure as initial appData
        expect(orderAppData.appCode).toBe(initialAppData.appCode)
        expect(orderAppData.version).toBe(initialAppData.version)

        // Verify that getQuote was NOT called again
        expect(getQuoteMock).toHaveBeenCalledTimes(1)
      })

      it('should merge advancedSettings.appData with initial appDataInfo correctly', async () => {
        const { postSwapOrderFromQuote } = await getQuoteWithBridge(mockProvider, {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        })

        const customAppData = {
          metadata: {
            orderClass: {
              orderClass: 'limit' as const,
            },
            utm: {
              utmSource: 'test-source',
              utmMedium: 'test-medium',
              utmCampaign: 'test-campaign',
            },
          },
        }

        await postSwapOrderFromQuote({
          appData: customAppData,
        })

        // Verify that sendOrder was called
        expect(sendOrderMock).toHaveBeenCalledTimes(1)

        // Verify that the merged appData contains both initial and custom metadata
        const sendOrderCall = sendOrderMock.mock.calls[0][0]
        const orderAppData = JSON.parse(sendOrderCall.appData)

        // Should have the custom metadata
        expect(orderAppData.metadata.orderClass.orderClass).toBe('limit')
        expect(orderAppData.metadata.utm.utmSource).toBe('test-source')
        expect(orderAppData.metadata.utm.utmMedium).toBe('test-medium')
        expect(orderAppData.metadata.utm.utmCampaign).toBe('test-campaign')

        // Should preserve the initial appCode and version
        expect(orderAppData.appCode).toBeDefined()
        expect(orderAppData.version).toBeDefined()
      })

      it('should not refetch quote when using ReceiverAccountBridgeProvider', async () => {
        const { postSwapOrderFromQuote } = await getQuoteWithBridge(mockProvider, {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        })

        const customAppData = {
          metadata: {
            quote: {
              slippageBips: 200,
            },
          },
        }

        // Call postSwapOrderFromQuote with custom appData
        await postSwapOrderFromQuote({
          appData: customAppData,
        })

        // Verify getQuote was only called once (during initial quote, not during post)
        expect(getQuoteMock).toHaveBeenCalledTimes(1)

        // Call again with different appData
        await postSwapOrderFromQuote({
          appData: {
            metadata: {
              quote: {
                slippageBips: 300,
              },
            },
          },
        })

        // Still should be called only once
        expect(getQuoteMock).toHaveBeenCalledTimes(1)
      })
    })
  })
})
