import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'

import { postSolanaSponsoredOrder } from './postSponsoredOrder'

const UID = '0xef1b0653aff11fedb80391a424858ae82957e301633608d4d297d0861d9d58bb'
const TRANSACTION = 'AQABAgMEBQY='

function createOrderBookApi(sendSolanaOrder = jest.fn().mockResolvedValue(UID)): {
  orderBookApi: OrderBookApi
  sendSolanaOrder: jest.Mock
} {
  return { orderBookApi: { sendSolanaOrder } as unknown as OrderBookApi, sendSolanaOrder }
}

describe('postSolanaSponsoredOrder', () => {
  it('posts the transaction and returns the order uid', async () => {
    const { orderBookApi, sendSolanaOrder } = createOrderBookApi()

    const uid = await postSolanaSponsoredOrder({ transaction: TRANSACTION, quoteId: 42 }, { orderBookApi })

    expect(sendSolanaOrder).toHaveBeenCalledWith({ transaction: TRANSACTION, quoteId: 42 }, expect.anything())
    expect(uid).toBe(UID)
  })

  it('posts without a quoteId when none is given', async () => {
    const { orderBookApi, sendSolanaOrder } = createOrderBookApi()

    await postSolanaSponsoredOrder({ transaction: TRANSACTION }, { orderBookApi })

    expect(sendSolanaOrder).toHaveBeenCalledWith({ transaction: TRANSACTION }, expect.anything())
  })

  // A supplied client carries whatever chain it was built for; the order still has to reach Solana.
  it('forces the Solana chain on a supplied client', async () => {
    const { orderBookApi, sendSolanaOrder } = createOrderBookApi()

    await postSolanaSponsoredOrder({ transaction: TRANSACTION }, { orderBookApi })

    expect(sendSolanaOrder).toHaveBeenCalledWith(expect.anything(), { chainId: SupportedChainId.SOLANA })
  })

  it('forwards an explicit env', async () => {
    const { orderBookApi, sendSolanaOrder } = createOrderBookApi()

    await postSolanaSponsoredOrder({ transaction: TRANSACTION }, { orderBookApi, env: 'staging' })

    expect(sendSolanaOrder).toHaveBeenCalledWith(expect.anything(), {
      chainId: SupportedChainId.SOLANA,
      env: 'staging',
    })
  })

  describe('default client', () => {
    function spyOnDefaultClient(): { context: () => OrderBookApi['context'] | undefined; restore: () => void } {
      let seen: OrderBookApi['context'] | undefined
      const spy = jest.spyOn(OrderBookApi.prototype, 'sendSolanaOrder').mockImplementation(function (
        this: OrderBookApi,
      ) {
        seen = this.context

        return Promise.resolve(UID)
      })

      return { context: () => seen, restore: () => spy.mockRestore() }
    }

    it('builds it for Solana', async () => {
      const { context, restore } = spyOnDefaultClient()

      try {
        await postSolanaSponsoredOrder({ transaction: TRANSACTION }, { env: 'staging' })

        expect(context()?.chainId).toBe(SupportedChainId.SOLANA)
        expect(context()?.env).toBe('staging')
      } finally {
        restore()
      }
    })

    // An explicit `env: undefined` would land on staging: the client resolves anything but `prod` to
    // the staging base urls, so the default must survive rather than be overwritten.
    it('stays on prod when no env is given', async () => {
      const { context, restore } = spyOnDefaultClient()

      try {
        await postSolanaSponsoredOrder({ transaction: TRANSACTION })

        expect(context()?.env).toBe('prod')
      } finally {
        restore()
      }
    })
  })
})
