import { getQuoteWithBridge } from './getQuoteWithBridge'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import {
  bridgeCallDetails,
  bridgeQuoteResult,
  cowShedForAccount,
  getMockSigner,
  intermediateToken,
  intermediateTokenDecimals,
  orderQuoteResponse,
  quoteBridgeRequest,
} from './mock/bridgeRequestMocks'
import { MockBridgeProvider } from '../providers/mock/MockBridgeProvider'
import { getEthFlowContract, TradingSdk } from '@cowprotocol/sdk-trading'
import { SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'
import { QuoteBridgeRequest } from '../types'
import { NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/sdk-config'
import { createAdapters } from '../../tests/setup'
import { setGlobalAdapter, Signer, SignerLike } from '@cowprotocol/sdk-common'
describe('getQuoteWithBridge', () => {
  let tradingSdk: TradingSdk
  let orderBookApi: OrderBookApi
  let mockProvider: MockBridgeProvider

  let getQuoteMock: jest.Mock
  let getUnsignedBridgeCallMock: jest.Mock
  let sendOrderMock: jest.Mock
  let mockSigner: Signer
  const adapters = createAdapters()
  const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
  adapterNames.forEach((adapterName) => {
    describe(`with ${adapterName}`, () => {
      beforeEach(() => {
        jest.clearAllMocks()

        const adapter = adapters[adapterName]
        setGlobalAdapter(adapter)
        mockSigner = getMockSigner(adapter)
        quoteBridgeRequest.signer = mockSigner as SignerLike

        mockProvider = new MockBridgeProvider()
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
        return getQuoteWithBridge({
          swapAndBridgeRequest: request,
          provider: mockProvider,
          tradingSdk,
          getErc20Decimals: async (_: TargetChainId, tokenAddress: string) => {
            if (tokenAddress !== intermediateToken) {
              throw new Error('This mock its supposed to be used for intermediate token')
            }

            return intermediateTokenDecimals
          },
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

        const ethFlowContract = getEthFlowContract(mockSigner)
        const sendTxCall = ((mockSigner as any).sendTransaction as unknown as jest.Mock).mock.calls[0][0]
        const data = ethFlowContract.interface.decodeFunctionData('createOrder', sendTxCall.data) as any
        expect(data.order.buyToken).toBe(intermediateToken)
        expect(data.order.receiver).toEqual(cowShedForAccount)
      })
    })
  })
})
