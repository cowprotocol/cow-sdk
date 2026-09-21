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

    expect(sendSolanaOrder).toHaveBeenCalledWith({ transaction: TRANSACTION, quoteId: 42 })
    expect(uid).toBe(UID)
  })

  it('posts without a quoteId when none is given', async () => {
    const { orderBookApi, sendSolanaOrder } = createOrderBookApi()

    await postSolanaSponsoredOrder({ transaction: TRANSACTION }, { orderBookApi })

    expect(sendSolanaOrder).toHaveBeenCalledWith({ transaction: TRANSACTION })
  })

  it('defaults to a Solana order book when no instance is supplied', async () => {
    let context: OrderBookApi['context'] | undefined
    const sendSolanaOrder = jest
      .spyOn(OrderBookApi.prototype, 'sendSolanaOrder')
      .mockImplementation(function (this: OrderBookApi) {
        context = this.context

        return Promise.resolve(UID)
      })

    try {
      await postSolanaSponsoredOrder({ transaction: TRANSACTION }, { env: 'staging' })

      expect(context?.chainId).toBe(SupportedChainId.SOLANA)
      expect(context?.env).toBe('staging')
    } finally {
      sendSolanaOrder.mockRestore()
    }
  })
})
