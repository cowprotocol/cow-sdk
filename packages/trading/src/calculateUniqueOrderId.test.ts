jest.mock('@cowprotocol/sdk-order-signing', () => ({
  OrderSigningUtils: {
    generateOrderId: jest.fn(),
  },
}))

import { calculateUniqueOrderId } from './calculateUniqueOrderId'
import {
  BARN_ETH_FLOW_ADDRESSES,
  ETH_FLOW_ADDRESSES,
  MAX_VALID_TO_EPOCH,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/sdk-config'
import { OrderSigningUtils as OrderSigningUtilsMock, UnsignedOrder } from '@cowprotocol/sdk-order-signing'
import { BuyTokenDestination, OrderKind, SellTokenSource } from '@cowprotocol/sdk-order-book'

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
    expect(order.sellToken).toBe(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET].address)
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
            })(),
          )
        })
        await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock, checkEthFlowOrderExists)

        const [chainId, order] = generateOrderId.mock.calls[1]

        expect(chainId).toBe(SupportedChainId.MAINNET)
        expect(order.buyAmount).toBe('99')
      })
    })
  })

  describe('options.ethFlowContractOverride', () => {
    it('should use default ETH flow address as owner when no override provided', async () => {
      await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock)

      const [, , params] = generateOrderId.mock.calls[0]

      expect(params.owner).toBe(ETH_FLOW_ADDRESSES[SupportedChainId.MAINNET])
    })

    it('should use BARN ETH flow address as owner when env is "staging"', async () => {
      await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock, undefined, { env: 'staging' })

      const [, , params] = generateOrderId.mock.calls[0]

      expect(params.owner).toBe(BARN_ETH_FLOW_ADDRESSES[SupportedChainId.MAINNET])
    })

    it('should use custom ethFlow address as owner when ethFlowContractOverride is provided', async () => {
      const customEthFlowAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

      await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock, undefined, {
        ethFlowContractOverride: { [SupportedChainId.MAINNET]: customEthFlowAddress },
      })

      const [, , params] = generateOrderId.mock.calls[0]

      expect(params.owner).toBe(customEthFlowAddress)
    })
  })

  describe('options.settlementContractOverride', () => {
    it('should pass options to generateOrderId', async () => {
      const customAddress = '0x1111111111111111111111111111111111111111' as const
      const options = { settlementContractOverride: { [SupportedChainId.MAINNET]: customAddress } }

      await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock, undefined, options)

      const [, , , passedOptions] = generateOrderId.mock.calls[0]

      expect(passedOptions).toEqual(options)
    })

    it('should preserve options in recursive call when order collision is detected', async () => {
      const customEthFlowAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const
      const options = { ethFlowContractOverride: { [SupportedChainId.MAINNET]: customEthFlowAddress } }

      let alreadyCalled = false
      const checkEthFlowOrderExists = jest.fn().mockImplementation(() => {
        return Promise.resolve(
          (() => {
            if (alreadyCalled) return false
            alreadyCalled = true
            return true
          })(),
        )
      })

      await calculateUniqueOrderId(SupportedChainId.MAINNET, orderMock, checkEthFlowOrderExists, options)

      const [, , , recursiveOptions] = generateOrderId.mock.calls[1]

      expect(recursiveOptions).toEqual(options)
    })
  })
})
