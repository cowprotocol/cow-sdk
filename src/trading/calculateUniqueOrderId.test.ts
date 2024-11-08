jest.mock('../order-signing', () => ({
  OrderSigningUtils: {
    generateOrderId: jest.fn(),
  },
}))

import { calculateUniqueOrderId } from './calculateUniqueOrderId'
import { MAX_VALID_TO_EPOCH, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '../common'
import { OrderSigningUtils as OrderSigningUtilsMock, UnsignedOrder } from '../order-signing'
import { BuyTokenDestination, OrderKind, SellTokenSource } from '../order-book/generated'

const orderMock: UnsignedOrder = {
  buyAmount: '100',
  buyToken: '0xb',
  buyTokenBalance: BuyTokenDestination.ERC20,
  sellAmount: '30',
  sellToken: '0xa',
  sellTokenBalance: SellTokenSource.ERC20,
  validTo: 10000033,
  feeAmount: '0',
  kind: OrderKind.BUY,
  partiallyFillable: false,
  receiver: '0x123',
  appData: '0x0004',
}

describe('calculateUniqueOrderId', () => {
  let generateOrderId: jest.SpyInstance

  beforeAll(() => {
    generateOrderId = OrderSigningUtilsMock.generateOrderId as unknown as jest.SpyInstance
  })

  beforeEach(() => {
    generateOrderId.mockResolvedValue({ orderDigest: '0x000dd', orderId: '0xab444' })
  })

  afterEach(() => {
    generateOrderId.mockReset()
  })

  it('Should always set validTo to the maximum value', async () => {
    await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock)

    const [chainId, order] = generateOrderId.mock.calls[0]

    expect(chainId).toBe(SupportedChainId.MAINNET)
    expect(order.validTo).toBe(MAX_VALID_TO_EPOCH)
  })
  it('Should always set sellToken to wrapped native token', async () => {
    await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock)

    const [chainId, order] = generateOrderId.mock.calls[0]

    expect(chainId).toBe(SupportedChainId.MAINNET)
    expect(order.sellToken).toBe(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET])
  })

  describe('When checkEthFlowOrderExists is set', () => {
    it('Then the callback should be called with the orderId and orderDigest', async () => {
      const checkEthFlowOrderExists = jest.fn().mockResolvedValue(false)
      await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock, checkEthFlowOrderExists)

      expect(checkEthFlowOrderExists).toHaveBeenCalledWith('0xab444', '0x000dd')
      expect(checkEthFlowOrderExists).toHaveBeenCalledTimes(1)
    })

    describe('When checkEthFlowOrderExists returns true', () => {
      it('Then it should call itself with the adjusted order', async () => {
        let alreadyCalled = false

        const checkEthFlowOrderExists = jest.fn().mockImplementation(() => {
          return Promise.resolve(
            (() => {
              if (alreadyCalled) return false
              alreadyCalled = true

              return true
            })()
          )
        })
        await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock, checkEthFlowOrderExists)

        const [chainId, order] = generateOrderId.mock.calls[1]

        expect(chainId).toBe(SupportedChainId.MAINNET)
        expect(order.buyAmount).toBe('99')
      })
    })
  })
})
