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
import { createAdapters } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

import { TradingAppDataInfo, LimitOrderParameters } from './types'
import { SupportedEvmChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi, OrderKind } from '@cowprotocol/sdk-order-book'
import { postLimitOrder } from './postLimitOrder'

const defaultOrderParams: Omit<LimitOrderParameters, 'signer'> = {
  chainId: SupportedEvmChainId.GNOSIS_CHAIN,
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
const appDataMock = {} as unknown as TradingAppDataInfo

describe('postLimitOrder', () => {
  let buildAppDataMock: jest.SpyInstance
  let postCoWProtocolTradeMock: jest.SpyInstance
  let adapters: Record<string, any>

  beforeAll(async () => {
    buildAppDataMock = buildAppData as unknown as jest.SpyInstance
    postCoWProtocolTradeMock = postCoWProtocolTrade as unknown as jest.SpyInstance
    adapters = await createAdapters()
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

    for (const adapterName of Object.keys(adapters)) {
      setGlobalAdapter(adapters[adapterName])
      await postLimitOrder({ ...defaultOrderParams, signer: adapters[adapterName] }, advancedData, orderBookApiMock)

      const call = buildAppDataMock.mock.calls[0][1]
      expect(call).toEqual(advancedData.appData)
      buildAppDataMock.mockReset()
    }
  })

  it('Should call order posting with all specified parameters', async () => {
    for (const adapterName of Object.keys(adapters)) {
      setGlobalAdapter(adapters[adapterName])
      await postLimitOrder({ ...defaultOrderParams, signer: adapters[adapterName] }, {}, orderBookApiMock)

      expect(postCoWProtocolTradeMock).toHaveBeenCalledTimes(1)

      // Using expect.anything() for adapter since it's a complex object with internal properties that we don't need to verify
      expect(postCoWProtocolTradeMock).toHaveBeenCalledWith(
        orderBookApiMock,
        appDataMock,
        { ...defaultOrderParams, signer: adapters[adapterName], env: 'prod' },
        { applyCostsSlippageAndFees: false },
        expect.anything(),
      )
      postCoWProtocolTradeMock.mockReset()
    }
  })
})
