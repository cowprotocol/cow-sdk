jest.mock('../order-signing', () => {
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

import { AppDataInfo, LimitOrderParameters } from './types'
import { ETH_ADDRESS } from '../common'
import { SupportedChainId } from '../chains'
import { OrderBookApi, OrderKind } from '../order-book'
import { OrderSigningUtils as OrderSigningUtilsMock } from '../order-signing'
import { VoidSigner } from '@ethersproject/abstract-signer'

const signerAddress = '0x21c3de23d98caddc406e3d31b25e807addf33333'
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

const signer = new VoidSigner(signerAddress)
signer.getChainId = jest.fn().mockResolvedValue(SupportedChainId.GNOSIS_CHAIN)

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
} as unknown as AppDataInfo

describe('postCoWProtocolTrade', () => {
  let signOrderMock: jest.SpyInstance
  let postSellNativeCurrencyOrderMock: jest.SpyInstance

  beforeAll(() => {
    signOrderMock = OrderSigningUtilsMock.signOrder as unknown as jest.SpyInstance
    postSellNativeCurrencyOrderMock = postSellNativeCurrencyOrder as unknown as jest.SpyInstance
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

    const order = { ...defaultOrderParams, sellToken: ETH_ADDRESS }
    await postCoWProtocolTrade(orderBookApiMock, signer, appDataMock, order)

    expect(postSellNativeCurrencyOrderMock).toHaveBeenCalledTimes(1)
    expect(postSellNativeCurrencyOrderMock).toHaveBeenCalledWith(orderBookApiMock, signer, appDataMock, order, {})
  })

  it('API request should contain all specified parameters', async () => {
    sendOrderMock.mockResolvedValue('0x02')

    const order = { ...defaultOrderParams }
    await postCoWProtocolTrade(orderBookApiMock, signer, appDataMock, order)

    const callBody = sendOrderMock.mock.calls[0][0]

    expect(sendOrderMock).toHaveBeenCalledTimes(1)
    expect(callBody).toEqual({
      appData: appDataMock.fullAppData,
      appDataHash: appDataMock.appDataKeccak256,
      sellToken: '0xaaa',
      sellAmount: '1000000000000000000',
      sellTokenBalance: 'erc20',
      buyToken: '0xbbb',
      buyAmount: '1990000000000000000', // Slippage is taken into account
      buyTokenBalance: 'erc20',
      feeAmount: '0',
      from: signerAddress,
      kind: 'sell',
      partiallyFillable: false,
      quoteId: 31,
      receiver: signerAddress,
      signature: '0x000a1',
      signingScheme: 'eip712',
      validTo: 1487078508,
    })
  })

  it('should use owner address as "from" parameter in sendOrder', async () => {
    const ownerAddress = '0x1234567890123456789012345678901234567890'
    const order: LimitOrderParameters = {
      ...defaultOrderParams,
      owner: ownerAddress,
    }

    await postCoWProtocolTrade(orderBookApiMock, signer, appDataMock, order)

    // Verify the from parameter matches the owner address (which is different from the signer address)
    expect(sendOrderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: ownerAddress,
        receiver: ownerAddress,
      })
    )
    expect(ownerAddress).not.toBe(signerAddress)
  })

  it('should use the signer "from" parameter if the owner is not specified', async () => {
    const order: LimitOrderParameters = {
      ...defaultOrderParams,
      owner: undefined,
    }

    await postCoWProtocolTrade(orderBookApiMock, signer, appDataMock, order)

    // Verify the from parameter matches the owner address
    expect(sendOrderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: signerAddress,
        receiver: signerAddress,
      })
    )
  })
})
