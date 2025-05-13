import { getQuoteWithBridge } from './getQuoteWithBridge'
import { OrderBookApi } from '../../order-book'
import {
  bridgeCallDetails,
  bridgeQuoteResult,
  cowShedForAccount,
  intermediateToken,
  intermediateTokenDecimals,
  orderQuoteResponse,
  quoteBridgeRequest,
} from './mock/bridgeRequestMocks'
import { MockBridgeProvider } from '../providers/mock/MockBridgeProvider'
import { TradingSdk } from '../../trading'
import { SupportedChainId, TargetChainId } from '../../chains'

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
      sendOrder: sendOrderMock,
    } as unknown as OrderBookApi

    tradingSdk = new TradingSdk({}, { orderBookApi })
  })

  async function postOrderWithCustomReceiver(customReceiver: string) {
    const { postSwapOrderFromQuote } = await getQuoteWithBridge({
      swapAndBridgeRequest: quoteBridgeRequest,
      provider: mockProvider,
      tradingSdk,
      getErc20Decimals: async (_: TargetChainId, tokenAddress: string) => {
        if (tokenAddress !== intermediateToken) {
          throw new Error('This mock its supposed to be used for intermediate token')
        }

        return intermediateTokenDecimals
      },
    })

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
})
