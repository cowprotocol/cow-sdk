jest.mock('@cowprotocol/sdk-order-signing', () => {
  return {
    OrderSigningUtils: {
      signOrder: jest.fn(),
      getEip7702Signature: jest.fn(),
      getEip1271Signature: jest.fn(),
    },
  }
})

jest.mock('./postSellNativeCurrencyOrder', () => {
  return {
    postSellNativeCurrencyOrder: jest.fn(),
  }
})

jest.mock('./getIsEip7702Account', () => {
  return {
    getIsEip7702Account: jest.fn(),
  }
})

import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getIsEip7702Account } from './getIsEip7702Account'
import { AdaptersTestSetup, createAdapters, TEST_ADDRESS } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

import { TradingAppDataInfo, LimitOrderParameters } from './types'
import { ETH_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi, OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import { OrderSigningUtils as OrderSigningUtilsMock, UnsignedOrder } from '@cowprotocol/sdk-order-signing'

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
const uploadAppDataMock = jest.fn()
const orderBookApiMock = {
  context: {
    chainId: defaultOrderParams.chainId,
  },
  sendOrder: sendOrderMock,
  uploadAppData: uploadAppDataMock,
} as unknown as OrderBookApi
const appDataMock = {
  appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
  fullAppData:
    '{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"version":"1.3.0"}',
} as unknown as TradingAppDataInfo

// Expected app data after UTM modification
const expectedAppData = {
  appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
  fullAppData: `{"appCode":"CoW Swap","environment":"barn","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":201,"smartSlippage":true}},"version":"1.3.0"}`,
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
  let getEip7702SignatureMock: jest.SpyInstance
  let getEip1271SignatureMock: jest.SpyInstance
  let getIsEip7702AccountMock: jest.SpyInstance
  let postSellNativeCurrencyOrderMock: jest.SpyInstance
  let adapters: AdaptersTestSetup

  beforeAll(() => {
    signOrderMock = OrderSigningUtilsMock.signOrder as unknown as jest.SpyInstance
    getEip7702SignatureMock = OrderSigningUtilsMock.getEip7702Signature as unknown as jest.SpyInstance
    getEip1271SignatureMock = OrderSigningUtilsMock.getEip1271Signature as unknown as jest.SpyInstance
    getIsEip7702AccountMock = getIsEip7702Account as unknown as jest.SpyInstance
    postSellNativeCurrencyOrderMock = postSellNativeCurrencyOrder as unknown as jest.SpyInstance
    adapters = createAdapters()
  })

  beforeEach(() => {
    Date.now = jest.fn(() => currentTimestamp)
    signOrderMock.mockResolvedValue(signatureMock)
    // Default to a non-delegated EOA so the standard signOrder path is taken.
    getIsEip7702AccountMock.mockResolvedValue(false)
  })

  afterEach(() => {
    signOrderMock.mockReset()
    getEip7702SignatureMock.mockReset()
    getEip1271SignatureMock.mockReset()
    getIsEip7702AccountMock.mockReset()
    postSellNativeCurrencyOrderMock.mockReset()
    sendOrderMock.mockReset()
    uploadAppDataMock.mockReset()
  })

  // TODO: will be fixed later
  it.skip('When sell token is native, then should post on-chain order', async () => {
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
        {
          appDataKeccak256: expectedAppData.appDataKeccak256,
          fullAppData: expectedAppData.fullAppData,
        },
        order,
        {},
        expect.anything(),
      )
      postSellNativeCurrencyOrderMock.mockReset()
    }
  })

  // TODO: will be fixed later
  it.skip('API request should contain all specified parameters', async () => {
    sendOrderMock.mockResolvedValue('0x02')

    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order = { ...defaultOrderParams }
      await postCoWProtocolTrade(orderBookApiMock, appDataMock, order, {}, adapters[adapterName].signer)

      const callBody = sendOrderMock.mock.calls[0][0]

      expect(sendOrderMock).toHaveBeenCalledTimes(1)
      expect(callBody).toEqual(getExpectedOrderBody(expectedAppData))
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

  it('should call uploadAppData with appDataKeccak256 and fullAppData', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const order = { ...defaultOrderParams }

      await postCoWProtocolTrade(orderBookApiMock, appDataMock, order, {}, adapters[adapterName].signer)

      expect(uploadAppDataMock).toHaveBeenCalledTimes(1)
      expect(uploadAppDataMock).toHaveBeenCalledWith(appDataMock.appDataKeccak256, appDataMock.fullAppData)
      uploadAppDataMock.mockReset()
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

  it('When protocolFeeBps is in additionalParams with partnerFee, then buyAmount should account for protocol fee in partner fee base', async () => {
    const expectedBuyAmountWithProtocolFee = '1970090045022511257'
    const expectedBuyAmountWithoutProtocolFee = '1970100000000000000'

    const orderWithPartnerFee: LimitOrderParameters = {
      ...defaultOrderParams,
      partnerFee: { volumeBps: 100, recipient: '0xfeerecipient' },
    }

    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])

      await postCoWProtocolTrade(orderBookApiMock, appDataMock, orderWithPartnerFee, {}, adapters[adapterName].signer)
      expect(sendOrderMock.mock.calls[0][0].buyAmount).toBe(expectedBuyAmountWithoutProtocolFee)
      sendOrderMock.mockReset()

      await postCoWProtocolTrade(
        orderBookApiMock,
        appDataMock,
        orderWithPartnerFee,
        { protocolFeeBps: 5 },
        adapters[adapterName].signer,
      )
      expect(sendOrderMock.mock.calls[0][0].buyAmount).toBe(expectedBuyAmountWithProtocolFee)
      sendOrderMock.mockReset()
    }
  })

  describe('EIP-7702 delegated account', () => {
    const eip7702Signature = {
      signature: '0x7702aabbcc',
      signingScheme: SigningScheme.EIP1271,
    }

    beforeEach(() => {
      getIsEip7702AccountMock.mockResolvedValue(true)
      getEip7702SignatureMock.mockResolvedValue(eip7702Signature)
    })

    it('should route to getEip7702Signature instead of signOrder when account is delegated', async () => {
      setGlobalAdapter(adapters.ethersV5Adapter)

      await postCoWProtocolTrade(orderBookApiMock, appDataMock, defaultOrderParams, {}, adapters.ethersV5Adapter.signer)

      expect(getEip7702SignatureMock).toHaveBeenCalledTimes(1)
      expect(signOrderMock).not.toHaveBeenCalled()
    })

    it('should pass chainId, env, signing scheme, signer and overrides to getEip7702Signature', async () => {
      const customAddress = '0x1111111111111111111111111111111111111111'
      const chainId = defaultOrderParams.chainId
      setGlobalAdapter(adapters.ethersV5Adapter)

      const order: LimitOrderParameters = {
        ...defaultOrderParams,
        env: 'staging',
        settlementContractOverride: { [chainId]: customAddress },
      }

      await postCoWProtocolTrade(
        orderBookApiMock,
        appDataMock,
        order,
        { signingScheme: SigningScheme.EIP1271 },
        adapters.ethersV5Adapter.signer,
      )

      const [calledChainId, calledEnv, orderToSign, calledScheme, , calledOverride] =
        getEip7702SignatureMock.mock.calls[0]

      expect(calledChainId).toBe(chainId)
      expect(calledEnv).toBe('staging')
      expect(orderToSign).toEqual(expect.objectContaining({ sellToken: '0xaaa', buyToken: '0xbbb' }))
      expect(calledScheme).toBe(SigningScheme.EIP1271)
      expect(calledOverride).toEqual({ [chainId]: customAddress })
    })

    it('should post the order with the signature and scheme returned by getEip7702Signature', async () => {
      setGlobalAdapter(adapters.ethersV5Adapter)

      const result = await postCoWProtocolTrade(
        orderBookApiMock,
        appDataMock,
        defaultOrderParams,
        {},
        adapters.ethersV5Adapter.signer,
      )

      expect(sendOrderMock).toHaveBeenCalledWith(
        expect.objectContaining({
          signature: eip7702Signature.signature,
          signingScheme: eip7702Signature.signingScheme,
        }),
      )
      expect(result.signature).toBe(eip7702Signature.signature)
      expect(result.signingScheme).toBe(eip7702Signature.signingScheme)
    })

    it('should check delegation against the resolved "from" (owner) address', async () => {
      const ownerAddress = '0x1234567890123456789012345678901234567890'
      setGlobalAdapter(adapters.ethersV5Adapter)

      await postCoWProtocolTrade(
        orderBookApiMock,
        appDataMock,
        { ...defaultOrderParams, owner: ownerAddress },
        {},
        adapters.ethersV5Adapter.signer,
      )

      expect(getIsEip7702AccountMock).toHaveBeenCalledWith(ownerAddress)
    })
  })

  describe('settlementContractOverride', () => {
    it('should pass settlementContractOverride to signOrder', async () => {
      const customAddress = '0x1111111111111111111111111111111111111111'
      const chainId = defaultOrderParams.chainId

      setGlobalAdapter(adapters.ethersV5Adapter)
      const order: LimitOrderParameters = {
        ...defaultOrderParams,
        settlementContractOverride: { [chainId]: customAddress },
      }

      await postCoWProtocolTrade(orderBookApiMock, appDataMock, order, {}, adapters.ethersV5Adapter.signer)

      const [, , , options] = (signOrderMock as jest.Mock).mock.calls[0] as [
        UnsignedOrder,
        number,
        unknown,
        { settlementContractOverride?: Record<number, string> },
      ]
      expect(options.settlementContractOverride).toEqual({ [chainId]: customAddress })
    })

    it('should pass env to signOrder options', async () => {
      setGlobalAdapter(adapters.ethersV5Adapter)
      const order: LimitOrderParameters = {
        ...defaultOrderParams,
        env: 'staging',
      }

      await postCoWProtocolTrade(orderBookApiMock, appDataMock, order, {}, adapters.ethersV5Adapter.signer)

      const [, , , options] = (signOrderMock as jest.Mock).mock.calls[0] as [
        UnsignedOrder,
        number,
        unknown,
        { env?: string },
      ]
      expect(options.env).toBe('staging')
    })
  })
})
