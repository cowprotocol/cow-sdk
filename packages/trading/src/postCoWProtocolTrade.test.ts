jest.mock('@cowprotocol/sdk-order-signing', () => {
  return {
    OrderSigningUtils: {
      signOrder: jest.fn(),
    },
  }
})

jest.mock('./postSellNativeCurrencyOrder', () => {
  return {
    postSellNativeCurrencyOrder: jest.fn(),
  }
})

import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { AdaptersTestSetup, createAdapters, TEST_ADDRESS } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import sdkPackageJson from '../../sdk/package.json'

import { TradingAppDataInfo, LimitOrderParameters } from './types'
import { ETH_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi, OrderKind } from '@cowprotocol/sdk-order-book'
import { OrderSigningUtils as OrderSigningUtilsMock } from '@cowprotocol/sdk-order-signing'

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

const sendOrderMock = jest.fn()
const orderBookApiMock = {
  context: {
    chainId: defaultOrderParams.chainId,
  },
  sendOrder: sendOrderMock,
} as unknown as OrderBookApi
const appDataMock = {
  appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
  fullAppData:
    '{\\"appCode\\":\\"CoW Swap\\",\\"environment\\":\\"barn\\",\\"metadata\\":{\\"orderClass\\":{\\"orderClass\\":\\"market\\"},\\"quote\\":{\\"slippageBips\\":201,\\"smartSlippage\\":true}},\\"version\\":\\"1.3.0\\"}',
} as unknown as TradingAppDataInfo

// Expected app data after UTM modification
const expectedAppDataWithUTM = {
  appDataKeccak256: '0xf40aa9915012f1ca0441e6833b11746207448c83ef629107220bf81fb3af8a91',
  fullAppData: `{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"utm":{"utmCampaign":"developer-cohort","utmContent":"🐮 moo-ving to defi 🐮","utmMedium":"cow-sdk@${sdkPackageJson.version}","utmSource":"cowmunity","utmTerm":"js"},"version":"1.3.0"}`,
}

// Common expected order body parameters
const getExpectedOrderBody = (appData: any) => ({
  appData: appData.fullAppData,
  appDataHash: appData.appDataKeccak256,
  sellToken: '0xaaa',
  sellAmount: '1000000000000000000',
  sellTokenBalance: 'erc20',
  buyToken: '0xbbb',
  buyAmount: '1990000000000000000',
  buyTokenBalance: 'erc20',
  feeAmount: '0',
  from: TEST_ADDRESS,
  kind: 'sell',
  partiallyFillable: false,
  quoteId: 31,
  receiver: TEST_ADDRESS,
  signature: '0x000a1',
  signingScheme: 'eip712',
  validTo: 1487078508,
})

describe('postCoWProtocolTrade', () => {
  let signOrderMock: jest.SpyInstance
  let postSellNativeCurrencyOrderMock: jest.SpyInstance
  let adapters: AdaptersTestSetup

  beforeAll(() => {
    signOrderMock = OrderSigningUtilsMock.signOrder as unknown as jest.SpyInstance
    postSellNativeCurrencyOrderMock = postSellNativeCurrencyOrder as unknown as jest.SpyInstance
    adapters = createAdapters()
  })

  beforeEach(() => {
    Date.now = jest.fn(() => currentTimestamp)
    signOrderMock.mockResolvedValue(signatureMock)
  })

  afterEach(() => {
    signOrderMock.mockReset()
    postSellNativeCurrencyOrderMock.mockReset()
    sendOrderMock.mockReset()
  })

  it('When sell token is native, then should post on-chain order', async () => {
    postSellNativeCurrencyOrderMock.mockResolvedValue({ orderId: '0x01' })

    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order = { ...defaultOrderParams, sellToken: ETH_ADDRESS }
      await postCoWProtocolTrade(orderBookApiMock, appDataMock, order, {}, adapters[adapterName].signer)

      expect(postSellNativeCurrencyOrderMock).toHaveBeenCalledTimes(1)
      // Using expect.anything() for adapter since it's a complex object with internal properties that we don't need to verify

      expect(postSellNativeCurrencyOrderMock).toHaveBeenCalledWith(
        orderBookApiMock,
        expect.objectContaining({
          appDataKeccak256: expectedAppDataWithUTM.appDataKeccak256,
          fullAppData: expectedAppDataWithUTM.fullAppData,
        }),
        order,
        {},
        expect.anything(),
      )
      postSellNativeCurrencyOrderMock.mockReset()
    }
  })

  it('API request should contain all specified parameters', async () => {
    sendOrderMock.mockResolvedValue('0x02')

    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order = { ...defaultOrderParams }
      await postCoWProtocolTrade(orderBookApiMock, appDataMock, order, {}, adapters[adapterName].signer)

      const callBody = sendOrderMock.mock.calls[0][0]

      expect(sendOrderMock).toHaveBeenCalledTimes(1)
      expect(callBody).toEqual(getExpectedOrderBody(expectedAppDataWithUTM))
      sendOrderMock.mockReset()
    }
  })

  it('should use owner address as "from" parameter in sendOrder', async () => {
    const ownerAddress = '0x1234567890123456789012345678901234567890'
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order: LimitOrderParameters = {
        ...defaultOrderParams,
        owner: ownerAddress,
      }

      await postCoWProtocolTrade(orderBookApiMock, appDataMock, order, {}, adapters[adapterName].signer)

      // Verify the from parameter matches the owner address (which is different from the signer address)
      expect(sendOrderMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: ownerAddress,
          receiver: ownerAddress,
        }),
      )
      expect(ownerAddress).not.toBe(TEST_ADDRESS)
      sendOrderMock.mockReset()
    }
  })

  it('should use the signer "from" parameter if the owner is not specified', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order: LimitOrderParameters = {
        ...defaultOrderParams,
        signer: adapters[adapterName].signer,
        owner: undefined,
      }

      await postCoWProtocolTrade(orderBookApiMock, appDataMock, order, {}, adapters[adapterName].signer)

      // Verify the from parameter matches the owner address
      expect(sendOrderMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: TEST_ADDRESS,
          receiver: TEST_ADDRESS,
        }),
      )
      sendOrderMock.mockReset()
    }
  })
})
