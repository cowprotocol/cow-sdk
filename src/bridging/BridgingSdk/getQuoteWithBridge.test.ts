import { SupportedChainId } from '../../chains'
import { NATIVE_CURRENCY_ADDRESS } from '../../common'
import { getHookMockForCostEstimation } from '../../hooks/utils'
import { OrderBookApi } from '../../order-book'
import { TradingSdk } from '../../trading'
import { getEthFlowContract } from '../../trading/getEthFlowTransaction'
import { MockBridgeProvider } from '../providers/mock/MockBridgeProvider'
import { QuoteBridgeRequest } from '../types'
import { getQuoteWithBridge } from './getQuoteWithBridge'
import {
  bridgeCallDetails,
  bridgeQuoteResult,
  cowShedForAccount,
  intermediateToken,
  mockSigner,
  orderQuoteResponse,
  quoteBridgeRequest,
} from './mock/bridgeRequestMocks'

describe('getQuoteWithBridge', () => {
  let tradingSdk: TradingSdk
  let orderBookApi: OrderBookApi
  let mockProvider: MockBridgeProvider

  let getQuoteMock: jest.Mock
  let getUnsignedBridgeCallMock: jest.Mock
  let sendOrderMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

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

    const ethFlowContract = getEthFlowContract(mockSigner, SupportedChainId.GNOSIS_CHAIN)
    const sendTxCall = (mockSigner.sendTransaction as unknown as jest.Mock).mock.calls[0][0]
    const data = ethFlowContract.interface.decodeFunctionData('createOrder', sendTxCall.data)

    expect(data.order.buyToken).toBe(intermediateToken)
    expect(data.order.receiver).toEqual(cowShedForAccount)
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
})
