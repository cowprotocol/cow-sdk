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

jest.mock('./postCoWProtocolTrade', () => {
  return {
    postCoWProtocolTrade: jest.fn(),
  }
})

jest.mock('./appDataUtils', () => {
  return {
    buildAppData: jest.fn(),
  }
})

import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { buildAppData } from './appDataUtils'

import { AppDataInfo, LimitOrderParameters } from './types'
import { SupportedChainId } from '../common'
import { OrderBookApi, OrderKind } from '../order-book'
import { postLimitOrder } from './postLimitOrder'

const defaultOrderParams: LimitOrderParameters = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  signer: '1bb337bafb276f779c3035874b8914e4b851bb989dbb34e776397076576f3804',
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

const orderBookApiMock = {} as unknown as OrderBookApi
const appDataMock = {} as unknown as AppDataInfo

describe('postLimitOrder', () => {
  let buildAppDataMock: jest.SpyInstance
  let postCoWProtocolTradeMock: jest.SpyInstance

  beforeAll(() => {
    buildAppDataMock = buildAppData as unknown as jest.SpyInstance
    postCoWProtocolTradeMock = postCoWProtocolTrade as unknown as jest.SpyInstance
  })

  beforeEach(() => {
    Date.now = jest.fn(() => currentTimestamp)

    buildAppDataMock.mockResolvedValue(appDataMock)
  })

  afterEach(() => {
    buildAppDataMock.mockReset()
    postCoWProtocolTradeMock.mockReset()
  })

  it('Should add advanced appData parameters', async () => {
    const advancedData = { appData: { environment: 'sandbox' } }

    await postLimitOrder(defaultOrderParams, advancedData, orderBookApiMock)

    const call = buildAppDataMock.mock.calls[0][1]

    expect(call).toEqual(advancedData.appData)
  })

  it('Should call order posting with all specified parameters', async () => {
    await postLimitOrder(defaultOrderParams, {}, orderBookApiMock)

    expect(postCoWProtocolTradeMock).toHaveBeenCalledTimes(1)
    expect(postCoWProtocolTradeMock).toHaveBeenCalledWith(
      orderBookApiMock,
      expect.anything(),
      appDataMock,
      defaultOrderParams
    )
  })
})
