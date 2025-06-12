import { getBridgeSignedHook } from './getBridgeSignedHook'
import { QuoteBridgeRequest } from '../types'
import { BridgeResultContext } from './types'
import { OrderSigningUtils } from '../../order-signing'
import { keccak256 } from 'ethers/lib/utils'

jest.mock('../../order-signing', () => ({
  ...jest.requireActual('../../order-signing'),
  OrderSigningUtils: {
    generateOrderId: jest.fn().mockResolvedValue({
      orderId:
        '0x5304214e957c583cf88d1d395d8be45b7fdd458e54ac711b59173f0c4afff969bbcf91605c18a9859c1d47abfeed5d2cca7097cf683edc4b',
    }),
  },
}))

const bridgeRequestMock = {
  sellTokenChainId: 1,
} as unknown as QuoteBridgeRequest

const bridgingQuoteMock = {}
const unsignedBridgeCallMock = {}
const signedHookMock = {}

const owner = '0x000a1'

const contextMock = {
  swapResult: {
    orderToSign: {},
    tradeParameters: {
      owner,
    },
  },
  provider: {
    getQuote: jest.fn().mockResolvedValue(bridgingQuoteMock),
    getUnsignedBridgeCall: jest.fn().mockResolvedValue(unsignedBridgeCallMock),
    getSignedHook: jest.fn().mockResolvedValue(signedHookMock),
  },
  signer: {},
  defaultGasLimit: 100000n,
} as unknown as BridgeResultContext

describe('getBridgeSignedHook', () => {
  let generateOrderIdMock: jest.SpyInstance

  beforeAll(() => {
    generateOrderIdMock = OrderSigningUtils.generateOrderId as unknown as jest.SpyInstance
  })

  afterEach(() => {
    generateOrderIdMock.mockReset()
  })

  it('Should create a bridge hook nonce based on orderId and specified owner', async () => {
    await getBridgeSignedHook(bridgeRequestMock, contextMock)

    expect(generateOrderIdMock).toHaveBeenCalledTimes(1)
    expect(generateOrderIdMock).toHaveBeenCalledWith(
      bridgeRequestMock.sellTokenChainId,
      contextMock.swapResult.orderToSign,
      { owner },
    )

    expect(contextMock.provider.getSignedHook).toHaveBeenCalledTimes(1)
    expect(contextMock.provider.getSignedHook).toHaveBeenCalledWith(
      bridgeRequestMock.sellTokenChainId,
      unsignedBridgeCallMock,
      contextMock.signer,
      // Nonce is a keccak256 of orderId
      keccak256(
        '0x5304214e957c583cf88d1d395d8be45b7fdd458e54ac711b59173f0c4afff969bbcf91605c18a9859c1d47abfeed5d2cca7097cf683edc4b',
      ),
      contextMock.defaultGasLimit,
    )
  })
})
