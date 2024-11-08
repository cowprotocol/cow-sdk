import { postCoWProtocolTrade } from './postCoWProtocolTrade'

jest.mock('cross-fetch', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetchMock = require('jest-fetch-mock')
  // Require the original module to not be mocked...
  const originalFetch = jest.requireActual('cross-fetch')
  return {
    __esModule: true,
    ...originalFetch,
    default: fetchMock,
  }
})

jest.mock('../order-signing', () => {
  return {
    OrderSigningUtils: {
      signOrder: jest.fn(),
    },
  }
})

jest.mock('./postOnChainTrade', () => {
  return {
    postOnChainTrade: jest.fn(),
  }
})

import { postOnChainTrade } from './postOnChainTrade'

import { AppDataInfo, LimitOrderParameters } from './types'
import { ETH_ADDRESS, SupportedChainId } from '../common'
import { OrderBookApi, OrderKind } from '../order-book'
import { OrderSigningUtils as OrderSigningUtilsMock } from '../order-signing'
import { VoidSigner } from '@ethersproject/abstract-signer'

const defaultOrderParams: LimitOrderParameters = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  signer: '0x006',
  appCode: '0x007',
  sellToken: '0xaaa',
  sellTokenDecimals: 18,
  buyToken: '0xbbb',
  buyTokenDecimals: 18,
  sellAmount: '1000000000000000000',
  buyAmount: '2000000000000000000',
  kind: OrderKind.SELL,
  quoteId: 31,
  slippageBps: 50,
}

const currentTimestamp = 1487076708000

const signatureMock = { signature: '0x000a1', signingScheme: 'eip712' }

const signer = new VoidSigner('0x21c3de23d98caddc406e3d31b25e807addf33333')

const sendOrderMock = jest.fn()
const orderBookApiMock = {
  sendOrder: sendOrderMock,
} as unknown as OrderBookApi
const appDataMock = {} as unknown as AppDataInfo

describe('postCoWProtocolTrade', () => {
  let signOrderMock: jest.SpyInstance
  let postOnChainTradeMock: jest.SpyInstance

  beforeAll(() => {
    signOrderMock = OrderSigningUtilsMock.signOrder as unknown as jest.SpyInstance
    postOnChainTradeMock = postOnChainTrade as unknown as jest.SpyInstance
  })

  beforeEach(() => {
    Date.now = jest.fn(() => currentTimestamp)
    signOrderMock.mockResolvedValue(signatureMock)
  })

  afterEach(() => {
    signOrderMock.mockReset()
    postOnChainTradeMock.mockReset()
    sendOrderMock.mockReset()
  })

  it('When sell token is native, then should post on-chain order', async () => {
    postOnChainTradeMock.mockResolvedValue({ orderId: '0x01' })

    const order = { ...defaultOrderParams, sellToken: ETH_ADDRESS }
    await postCoWProtocolTrade(orderBookApiMock, signer, appDataMock, order)

    expect(postOnChainTradeMock).toHaveBeenCalledTimes(1)
    expect(postOnChainTradeMock).toHaveBeenCalledWith(orderBookApiMock, signer, appDataMock, order, '0')
  })

  it('API request should contain all specified parameters', async () => {
    sendOrderMock.mockResolvedValue('0x02')

    const order = { ...defaultOrderParams }
    await postCoWProtocolTrade(orderBookApiMock, signer, appDataMock, order)

    const callBody = sendOrderMock.mock.calls[0][0]

    expect(sendOrderMock).toHaveBeenCalledTimes(1)
    expect(callBody).toEqual({
      sellToken: '0xaaa',
      sellAmount: '1000000000000000000',
      buyToken: '0xbbb',
      buyAmount: '1990000000000000000', // Slippage is taken into account
      feeAmount: '0',
      from: '0x21c3de23d98caddc406e3d31b25e807addf33333',
      kind: 'sell',
      partiallyFillable: false,
      quoteId: 31,
      receiver: '0x21c3de23d98caddc406e3d31b25e807addf33333',
      signature: '0x000a1',
      signingScheme: 'eip712',
      validTo: 1487077308,
    })
  })
})