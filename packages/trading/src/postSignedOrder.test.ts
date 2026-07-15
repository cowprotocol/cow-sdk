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

import { postSignedOrder } from './postSignedOrder'
import { getOrderToSubmit, OrderToSubmit } from './getOrderToSubmit'
import { getOrderToSign } from './getOrderToSign'
import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { AdaptersTestSetup, createAdapters, TEST_ADDRESS } from '../tests/setup'
import { AccountAddress, setGlobalAdapter } from '@cowprotocol/sdk-common'

import { TradingAppDataInfo, LimitOrderParameters, TradeParameters } from './types'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi, OrderKind, OrderQuoteResponse, SigningScheme } from '@cowprotocol/sdk-order-book'
import { OrderSigningUtils as OrderSigningUtilsMock } from '@cowprotocol/sdk-order-signing'

const owner = TEST_ADDRESS as AccountAddress

const defaultOrderParams: LimitOrderParameters = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  signer: '0x006',
  appCode: '0x007',
  owner,
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

const SIGNATURE = '0x000a1'

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

function getOrderToSubmitFixture(): OrderToSubmit {
  const orderToSign = getOrderToSign(
    { chainId: defaultOrderParams.chainId, from: owner, isEthFlow: false },
    defaultOrderParams,
    appDataMock.appDataKeccak256,
  )

  return getOrderToSubmit({
    orderToSign,
    appDataInfo: appDataMock,
    quoteResponse: { id: defaultOrderParams.quoteId } as OrderQuoteResponse,
    tradeParameters: { ...defaultOrderParams, amount: defaultOrderParams.sellAmount } as TradeParameters,
  })
}

describe('postSignedOrder', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => currentTimestamp)
    sendOrderMock.mockResolvedValue('0x0order-id')
  })

  afterEach(() => {
    sendOrderMock.mockReset()
    uploadAppDataMock.mockReset()
  })

  it('should upload app-data before sending the order', async () => {
    await postSignedOrder(orderBookApiMock, getOrderToSubmitFixture(), SIGNATURE)

    expect(uploadAppDataMock).toHaveBeenCalledTimes(1)
    expect(uploadAppDataMock).toHaveBeenCalledWith(appDataMock.appDataKeccak256, appDataMock.fullAppData)
    expect(uploadAppDataMock.mock.invocationCallOrder[0]).toBeLessThan(sendOrderMock.mock.invocationCallOrder[0] ?? 0)
  })

  it('should send the order with the signature attached', async () => {
    const orderToSubmit = getOrderToSubmitFixture()

    const result = await postSignedOrder(orderBookApiMock, orderToSubmit, SIGNATURE)

    expect(sendOrderMock).toHaveBeenCalledTimes(1)
    expect(sendOrderMock).toHaveBeenCalledWith({ ...orderToSubmit, signature: SIGNATURE })
    expect(result).toEqual({
      orderId: '0x0order-id',
      signature: SIGNATURE,
      signingScheme: SigningScheme.EIP712,
    })
  })

  it('should skip the app-data upload for legacy hash-only orders', async () => {
    const orderToSubmit = { ...getOrderToSubmitFixture(), appData: appDataMock.appDataKeccak256 }

    await postSignedOrder(orderBookApiMock, orderToSubmit, SIGNATURE)

    expect(uploadAppDataMock).not.toHaveBeenCalled()
    expect(sendOrderMock).toHaveBeenCalledTimes(1)
  })

  describe('parity with postCoWProtocolTrade', () => {
    let signOrderMock: jest.SpyInstance
    let adapters: AdaptersTestSetup

    beforeAll(() => {
      signOrderMock = OrderSigningUtilsMock.signOrder as unknown as jest.SpyInstance
      adapters = createAdapters()
    })

    afterEach(() => {
      signOrderMock.mockReset()
    })

    it('same inputs produce an identical sendOrder body through the signer and signer-less paths', async () => {
      signOrderMock.mockResolvedValue({ signature: SIGNATURE, signingScheme: 'eip712' })
      setGlobalAdapter(adapters.ethersV5Adapter)

      // Signer path — the canonical flow
      await postCoWProtocolTrade(orderBookApiMock, appDataMock, defaultOrderParams, {}, adapters.ethersV5Adapter.signer)
      const signerBody = sendOrderMock.mock.calls[0][0]
      const signerUpload = uploadAppDataMock.mock.calls[0]
      sendOrderMock.mockReset()
      uploadAppDataMock.mockReset()

      // Signer-less path — same parameters, signature provided externally
      await postSignedOrder(orderBookApiMock, getOrderToSubmitFixture(), SIGNATURE)
      const signerlessBody = sendOrderMock.mock.calls[0][0]
      const signerlessUpload = uploadAppDataMock.mock.calls[0]

      expect(signerlessBody).toEqual(signerBody)
      expect(signerlessUpload).toEqual(signerUpload)
    })
  })
})
