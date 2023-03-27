import { OrderSignApi } from './api'
import { SupportedChainId } from '../common'
import { UnsignedOrder } from './types'
import { OrderKind } from '../order-book'
import { mock, instance, when, anything } from 'ts-mockito'
import type { TypedDataSigner } from '@cowprotocol/contracts'

describe('OrderSignApi', () => {
  const signature =
    '0xbb6aaa4207e9e97275934e26fc2fce3ed40a6d6b607870c1913cdb86b13070ec6196010f40e8ddfd36ad7f9eae033dfd5d4bf551feaf664a6ca768edde2d0a701c'
  const orderSignApi = new OrderSignApi()
  let signer: TypedDataSigner

  beforeEach(() => {
    signer = mock<TypedDataSigner>()

    when(signer._signTypedData(anything(), anything(), anything())).thenCall(() => {
      return Promise.resolve(signature)
    })
  })

  it('signOrder - should return an order signature', async () => {
    const order: UnsignedOrder = {
      sellToken: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
      buyToken: '0x7B878668Cd1a3adF89764D3a331E0A7BB832192D',
      receiver: '0xa6ddbd0de6b310819b49f680f65871bee85f517e',
      sellAmount: '500000000000000',
      buyAmount: '23000020000',
      validTo: 5000222,
      appData: '0x0',
      feeAmount: '2300000',
      kind: OrderKind.SELL,
      partiallyFillable: true,
    }
    const result = await orderSignApi.signOrder(order, SupportedChainId.MAINNET, instance(signer))

    expect(result.signature).toBe(signature)
  })

  it('signOrderCancellation - should return an order cancellation signature', async () => {
    const orderId =
      '0xdaaa7dddec9ad04cc101a121e3eed017eab4d3927c045d407d5ad6700eea2bf7fb3c7eb936caa12b5a884d612393969a557d430764060343'
    const result = await orderSignApi.signOrderCancellation(orderId, SupportedChainId.MAINNET, instance(signer))

    expect(result.signature).toBe(signature)
  })

  it('getDomain - should return an object with domain info', async () => {
    const domain = await orderSignApi.getDomain(SupportedChainId.MAINNET)

    expect(domain).toEqual({
      chainId: 1,
      name: 'Gnosis Protocol',
      verifyingContract: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
      version: 'v2',
    })
  })
})
