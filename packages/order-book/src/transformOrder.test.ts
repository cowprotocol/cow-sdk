import { Order, OrderClass, OrderKind, OrderStatus, SigningScheme } from './generated'
import { transformOrder } from './transformOrder'

const ORDER: Order = {
  sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  sellAmount: '1234567890',
  buyAmount: '1234567890',
  validTo: 0,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  partiallyFillable: true,
  kind: OrderKind.BUY,
  class: OrderClass.MARKET,
  feeAmount: '1234567890',
  signature:
    '0x4d306ce7c770d22005bcfc00223f8d9aaa04e8a20099cc986cb9ccf60c7e876b777ceafb1e03f359ebc6d3dc84245d111a3df584212b5679cb5f9e6717b69b031b',
  signingScheme: SigningScheme.EIP1271,
  creationDate: '2020-12-03T18:35:18.814523Z',
  owner: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  uid: '0x59920c85de0162e9e55df8d396e75f3b6b7c2dfdb535f03e5c807731c31585eaff714b8b0e2700303ec912bd40496c3997ceea2b616d6710',
  executedSellAmount: '1234567890',
  executedSellAmountBeforeFees: '1234567890',
  executedBuyAmount: '1234567890',
  executedFeeAmount: '1234567890',
  invalidated: true,
  status: OrderStatus.FULFILLED,
}

describe('transformOrder', () => {
  describe('addTotalFeeToOrder', () => {
    test('should use executedFeeAmount when executedFee is 0', () => {
      const rawOrder = { ...ORDER, executedFeeAmount: '1', executedFee: '0' }
      const transformedOrder = transformOrder(rawOrder)

      expect(transformedOrder.totalFee).toEqual('1')
    })

    test('should use executedFee when executedFeeAmount is 0', () => {
      const rawOrder = { ...ORDER, executedFeeAmount: '0', executedFee: '1' }
      const transformedOrder = transformOrder(rawOrder)

      expect(transformedOrder.totalFee).toEqual('1')
    })

    test('should use sum of executedFeeAmount and executedFee', () => {
      const rawOrder = { ...ORDER, executedFeeAmount: '1', executedFee: '1' }
      const transformedOrder = transformOrder(rawOrder)

      expect(transformedOrder.totalFee).toEqual('2')
    })

    test('should not fail when executedFee is falsy', () => {
      const rawOrder = { ...ORDER, executedFee: undefined }
      const transformedOrder = transformOrder(rawOrder)

      expect(transformedOrder.totalFee).toEqual('1234567890')
    })
  })
})
