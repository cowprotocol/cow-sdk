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
  appDataKeccak256: '0x27f66e72ac9570195fbc7780facf06079a103eae3962aa01554402e24cc1f9f0',
  fullAppData: `{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"utm":{"utmCampaign":"developer-cohort","utmContent":"🐮 moo-ving to defi 🐮","utmMedium":"cow-sdk@${sdkPackageJson.version}","utmSource":"cowmunity","utmTerm":"js"},"version":"1.3.0"}`,
}

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
      expect(callBody).toEqual({
        appData: expectedAppDataWithUTM.fullAppData,
        appDataHash: expectedAppDataWithUTM.appDataKeccak256,
        sellToken: '0xaaa',
        sellAmount: '1000000000000000000',
        sellTokenBalance: 'erc20',
        buyToken: '0xbbb',
        buyAmount: '1990000000000000000', // Slippage is taken into account
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

  it('should merge partial UTM data with defaults', async () => {
    const appDataWithPartialUTM = {
      appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
      fullAppData:
        '{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"utm":{"utmContent":"custom-content"},"version":"1.3.0"}',
    } as unknown as TradingAppDataInfo

    const expectedAppDataWithMergedUTM = {
      appDataKeccak256: '0x87c8cc7b90a78695e966c11e15f6dd48a4834af93a1dae27eb7dc55869184ab4',
      fullAppData: `{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"utm":{"utmCampaign":"developer-cohort","utmContent":"custom-content","utmMedium":"cow-sdk@${sdkPackageJson.version}","utmSource":"cowmunity","utmTerm":"js"},"version":"1.3.0"}`,
    }

    sendOrderMock.mockResolvedValue('0x03')

    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order = { ...defaultOrderParams }
      await postCoWProtocolTrade(orderBookApiMock, appDataWithPartialUTM, order, {}, adapters[adapterName].signer)

      const callBody = sendOrderMock.mock.calls[0][0]

      expect(sendOrderMock).toHaveBeenCalledTimes(1)
      expect(callBody).toEqual({
        appData: expectedAppDataWithMergedUTM.fullAppData,
        appDataHash: expectedAppDataWithMergedUTM.appDataKeccak256,
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
      sendOrderMock.mockReset()
    }
  })

  it('should ignore other UTM fields and use fixed defaults', async () => {
    const appDataWithOtherUtmFields = {
      appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
      fullAppData:
        '{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"utm":{"utmCampaign":"ignored-campaign","utmContent":"custom-content","utmMedium":"ignored-medium","utmSource":"ignored-source","utmTerm":"ignored-term"},"version":"1.3.0"}',
    } as unknown as TradingAppDataInfo

    const expectedAppDataWithFixedUtm = {
      appDataKeccak256: '0x87c8cc7b90a78695e966c11e15f6dd48a4834af93a1dae27eb7dc55869184ab4',
      fullAppData: `{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"utm":{"utmCampaign":"developer-cohort","utmContent":"custom-content","utmMedium":"cow-sdk@${sdkPackageJson.version}","utmSource":"cowmunity","utmTerm":"js"},"version":"1.3.0"}`,
    }

    sendOrderMock.mockResolvedValue('0x04')

    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order = { ...defaultOrderParams }
      await postCoWProtocolTrade(orderBookApiMock, appDataWithOtherUtmFields, order, {}, adapters[adapterName].signer)

      const callBody = sendOrderMock.mock.calls[0][0]

      expect(sendOrderMock).toHaveBeenCalledTimes(1)
      expect(callBody).toEqual({
        appData: expectedAppDataWithFixedUtm.fullAppData,
        appDataHash: expectedAppDataWithFixedUtm.appDataKeccak256,
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
      sendOrderMock.mockReset()
    }
  })

  it('should use global utmContent from SDK configuration', async () => {
    // Set global utmContent directly
    const tradingModule = await import('./tradingSdk')
    tradingModule.utmContent = 'global-sdk-content'

    const appDataWithoutUtm = {
      appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
      fullAppData:
        '{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"version":"1.3.0"}',
    } as unknown as TradingAppDataInfo

    const expectedAppDataWithGlobalUtm = {
      appDataKeccak256: '0xdaba49160dbc44a00e5a18173ae225495ad03ac0d71185ffd669d91d954e32c4',
      fullAppData: `{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"utm":{"utmCampaign":"developer-cohort","utmContent":"global-sdk-content","utmMedium":"cow-sdk@${sdkPackageJson.version}","utmSource":"cowmunity","utmTerm":"js"},"version":"1.3.0"}`,
    }

    sendOrderMock.mockResolvedValue('0x05')

    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order = { ...defaultOrderParams }
      await postCoWProtocolTrade(orderBookApiMock, appDataWithoutUtm, order, {}, adapters[adapterName].signer)

      const callBody = sendOrderMock.mock.calls[0][0]

      expect(sendOrderMock).toHaveBeenCalledTimes(1)
      expect(callBody).toEqual({
        appData: expectedAppDataWithGlobalUtm.fullAppData,
        appDataHash: expectedAppDataWithGlobalUtm.appDataKeccak256,
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
      sendOrderMock.mockReset()
    }

    // Reset global utmContent after test
    tradingModule.utmContent = undefined
  })

  it('should disable UTM when disableUtm is true', async () => {
    // Set global disableUtm to true
    const tradingModule = await import('./tradingSdk')
    tradingModule.disableUtm = true

    const appDataWithoutUtm = {
      appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
      fullAppData:
        '{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"version":"1.3.0"}',
    } as unknown as TradingAppDataInfo

    sendOrderMock.mockResolvedValue('0x06')

    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order = { ...defaultOrderParams }
      await postCoWProtocolTrade(orderBookApiMock, appDataWithoutUtm, order, {}, adapters[adapterName].signer)

      const callBody = sendOrderMock.mock.calls[0][0]

      expect(sendOrderMock).toHaveBeenCalledTimes(1)
      expect(callBody).toEqual({
        appData: appDataWithoutUtm.fullAppData,
        appDataHash: appDataWithoutUtm.appDataKeccak256,
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
      sendOrderMock.mockReset()
    }

    // Reset global disableUtm after test
    tradingModule.disableUtm = false
  })
})
