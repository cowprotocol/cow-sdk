import { SupportedChainId } from '@cowprotocol/sdk-config'
import { SolanaOrderBookApi } from '@cowprotocol/sdk-order-book/solana'

import { postSolanaSponsoredOrder } from './postSponsoredOrder'

const UID = '0xef1b0653aff11fedb80391a424858ae82957e301633608d4d297d0861d9d58bb'
const PARTIALLY_SIGNED_TX = 'AQABAgMEBQY='

function createSolanaOrderBookApi(sendOrder = jest.fn().mockResolvedValue(UID)): {
  orderBookApi: SolanaOrderBookApi
  sendOrder: jest.Mock
} {
  return { orderBookApi: { sendOrder } as unknown as SolanaOrderBookApi, sendOrder }
}

describe('postSolanaSponsoredOrder', () => {
  it('posts the transaction and returns the order uid', async () => {
    const { orderBookApi, sendOrder } = createSolanaOrderBookApi()

    const uid = await postSolanaSponsoredOrder(
      { partiallySignedTx: PARTIALLY_SIGNED_TX, quoteId: 42 },
      { orderBookApi },
    )

    expect(sendOrder).toHaveBeenCalledWith(
      { partiallySignedTx: PARTIALLY_SIGNED_TX, quoteId: 42 },
      expect.anything(),
    )
    expect(uid).toBe(UID)
  })

  it('posts without a quoteId when none is given', async () => {
    const { orderBookApi, sendOrder } = createSolanaOrderBookApi()

    await postSolanaSponsoredOrder({ partiallySignedTx: PARTIALLY_SIGNED_TX }, { orderBookApi })

    expect(sendOrder).toHaveBeenCalledWith({ partiallySignedTx: PARTIALLY_SIGNED_TX }, expect.anything())
  })

  // A supplied client carries whatever chain it was built for; the order still has to reach Solana.
  it('forces the Solana chain on a supplied client', async () => {
    const { orderBookApi, sendOrder } = createSolanaOrderBookApi()

    await postSolanaSponsoredOrder({ partiallySignedTx: PARTIALLY_SIGNED_TX }, { orderBookApi })

    expect(sendOrder).toHaveBeenCalledWith(expect.anything(), { chainId: SupportedChainId.SOLANA })
  })

  it('forwards an explicit env', async () => {
    const { orderBookApi, sendOrder } = createSolanaOrderBookApi()

    await postSolanaSponsoredOrder({ partiallySignedTx: PARTIALLY_SIGNED_TX }, { orderBookApi, env: 'staging' })

    expect(sendOrder).toHaveBeenCalledWith(expect.anything(), {
      chainId: SupportedChainId.SOLANA,
      env: 'staging',
    })
  })

  describe('default client', () => {
    function spyOnDefaultClient(): { context: () => SolanaOrderBookApi['context'] | undefined; restore: () => void } {
      let seen: SolanaOrderBookApi['context'] | undefined
      const spy = jest.spyOn(SolanaOrderBookApi.prototype, 'sendOrder').mockImplementation(function (
        this: SolanaOrderBookApi,
      ) {
        seen = this.context

        return Promise.resolve(UID)
      })

      return { context: () => seen, restore: () => spy.mockRestore() }
    }

    it('builds it for Solana', async () => {
      const { context, restore } = spyOnDefaultClient()

      try {
        await postSolanaSponsoredOrder({ partiallySignedTx: PARTIALLY_SIGNED_TX }, { env: 'staging' })

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
        await postSolanaSponsoredOrder({ partiallySignedTx: PARTIALLY_SIGNED_TX })

        expect(context()?.env).toBe('prod')
      } finally {
        restore()
      }
    })
  })
})
