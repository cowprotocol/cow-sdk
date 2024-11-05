import { mockGetOrder } from '../order-book/__mock__/api'
import {
  DEFAULT_ORDER_PARAMS,
  TestConditionalOrder,
  createTestConditionalOrder,
} from './orderTypes/test/TestConditionalOrder'
import { ConditionalOrder } from './ConditionalOrder'
import { Twap } from './orderTypes/Twap'

import { getComposableCow } from './contracts'
import { constants } from 'ethers'
import { OwnerContext, PollParams, PollResultCode, PollResultErrors } from './types'
import { BuyTokenDestination, OrderKind, SellTokenSource } from '../order-book/generated'
import { computeOrderUid } from '../utils'
import { GPv2Order } from '../common/generated/ComposableCoW'
import { OrderBookApi } from '../order-book'

jest.mock('./contracts')

jest.mock('../utils')

const mockGetComposableCow = getComposableCow as jest.MockedFunction<typeof getComposableCow>
const mockComputeOrderUid = computeOrderUid as jest.MockedFunction<typeof computeOrderUid>

const TWAP_SERIALIZED = (salt?: string, handler?: string): string => {
  return (
    '0x' +
    '0000000000000000000000000000000000000000000000000000000000000020' +
    '000000000000000000000000' +
    (handler?.substring(2) ?? '910d00a310f7dc5b29fe73458f47f519be547d3d') +
    (salt?.substring(2) ?? '9379a0bf532ff9a66ffde940f94b1a025d6f18803054c1aef52dc94b15255bbe') +
    '0000000000000000000000000000000000000000000000000000000000000060' +
    '0000000000000000000000000000000000000000000000000000000000000140' +
    '0000000000000000000000006810e776880c02933d47db1b9fc05908e5386b96' +
    '000000000000000000000000dae5f1590db13e3b40423b5b5c5fbf175515910b' +
    '000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef' +
    '000000000000000000000000000000000000000000000000016345785d8a0000' +
    '000000000000000000000000000000000000000000000000016345785d8a0000' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    '000000000000000000000000000000000000000000000000000000000000000a' +
    '0000000000000000000000000000000000000000000000000000000000000e10' +
    '0000000000000000000000000000000000000000000000000000000000000000' +
    'd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5'
  )
}

const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const SINGLE_ORDER = createTestConditionalOrder()
const MERKLE_ROOT_ORDER = createTestConditionalOrder({ isSingleOrder: false })
const DISCRETE_ORDER: GPv2Order.DataStruct = {
  sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  sellAmount: '1234567890',
  buyAmount: '1234567890',
  validTo: 0,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  partiallyFillable: true,
  sellTokenBalance: SellTokenSource.ERC20,
  buyTokenBalance: BuyTokenDestination.ERC20,
  kind: OrderKind.BUY,
  feeAmount: '0',
}
const ERROR_REASON = 'Not valid, because I say so!'

describe('Constructor', () => {
  test('Create TestConditionalOrder', () => {
    // bad address
    expect(() => createTestConditionalOrder({ handler: '0xdeadbeef' })).toThrow('Invalid handler: 0xdeadbeef')
  })

  test('Fail if bad address', () => {
    // bad address
    expect(() => createTestConditionalOrder({ handler: '0xdeadbeef' })).toThrow('Invalid handler: 0xdeadbeef')
  })

  describe('Fail if bad salt', () => {
    test('Fails if salt is not an hex', () => {
      expect(() =>
        createTestConditionalOrder({ handler: '0x910d00a310f7Dc5B29FE73458F47f519be547D3d', salt: 'cowtomoon' })
      ).toThrow('Invalid salt: cowtomoon')
    })

    test('Fails if salt is too short (not 32 bytes)', () => {
      expect(() =>
        createTestConditionalOrder({ handler: '0x910d00a310f7Dc5B29FE73458F47f519be547D3d', salt: '0xdeadbeef' })
      ).toThrow('Invalid salt: 0xdeadbeef')
    })

    test('Fails if salt is too long (not 32 bytes)', () => {
      expect(() =>
        createTestConditionalOrder({
          handler: '0x910d00a310f7Dc5B29FE73458F47f519be547D3d',
          salt: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        })
      ).toThrow(
        'Invalid salt: 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
      )
    })
  })
})
describe('Deserialize: Decode static input', () => {
  test('Fails if handler mismatch', () => {
    expect(() => Twap.deserialize(TWAP_SERIALIZED(undefined, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'))).toThrow(
      'HandlerMismatch'
    )
  })
})

describe('Serialize: Encode static input', () => {
  test('Serialize: Fails if wrong handler', () => {
    const order = createTestConditionalOrder({ handler: '0x910d00a310f7Dc5B29FE73458F47f519be547D3d' })
    expect(() => order.testEncodeStaticInput()).toThrow()
  })
})

describe('Compute orderUid', () => {
  test('Returns correct id', () => {
    expect(SINGLE_ORDER.id).toEqual('0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3')
  })

  test('Derive OrderId from leaf data', () => {
    expect(ConditionalOrder.leafToId(SINGLE_ORDER.leaf)).toEqual(
      '0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3'
    )
  })
})

describe('Cabinet', () => {
  const cabinetValue = '000000000000000000000000000000000000000000000000000000064f0b353'
  const mockCabinet = jest.fn()
  const param = { owner: OWNER } as OwnerContext
  beforeEach(() => {
    jest.resetAllMocks()

    mockGetComposableCow.mockReturnValue({
      callStatic: {
        cabinet: mockCabinet,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    mockCabinet.mockReturnValue(cabinetValue)
  })

  test('Single orders call the contract with order id as the ctx', () => {
    // GIVEN: a conditional order
    // WHEN: we call cabinet
    expect(SINGLE_ORDER.cabinet(param)).toEqual(cabinetValue)

    // THEN: we expect to do a CALL using the ComposableCoW contract passing the UID of the order
    expect(mockGetComposableCow).toHaveBeenCalledTimes(1)
    expect(mockCabinet.mock.calls).toHaveLength(1)

    // THEN: we expect the params to be the owner and the order id
    expect(mockCabinet.mock.calls[0]).toEqual([OWNER, SINGLE_ORDER.id])
  })

  test('Merkle Root orders call the contract with the 0x0 as the ctx', () => {
    // GIVEN: a merkle root order
    // WHEN: we call cabinet
    expect(MERKLE_ROOT_ORDER.cabinet(param)).toEqual(cabinetValue)

    // THEN: we expect to do a CALL using the ComposableCoW contract
    expect(mockGetComposableCow).toHaveBeenCalledTimes(1)
    expect(mockCabinet.mock.calls).toHaveLength(1)

    // THEN: we expect the params to be the owner and 0x0
    expect(mockCabinet.mock.calls[0]).toEqual([OWNER, constants.HashZero])
  })
})

describe('Poll Single Orders', () => {
  const mockSingleOrders = jest.fn()
  const mockGetTradeableOrderWithSignature = jest.fn()
  const chainId = 1
  const orderBookApi = new OrderBookApi({ chainId })
  const param = { owner: OWNER, chainId, provider: {}, orderBookApi } as PollParams

  const mockPollValidate = jest.fn<Promise<PollResultErrors | undefined>, [params: PollParams], any>()

  class MockTestConditionalOrder extends TestConditionalOrder {
    protected pollValidate(params: PollParams): Promise<PollResultErrors | undefined> {
      return mockPollValidate(params)
    }
  }

  const signature = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  beforeEach(() => {
    jest.resetAllMocks()

    mockGetComposableCow.mockReturnValue({
      callStatic: {
        singleOrders: mockSingleOrders,
      },
      getTradeableOrderWithSignature: mockGetTradeableOrderWithSignature,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    mockComputeOrderUid.mockReturnValue(Promise.resolve(SINGLE_ORDER.id))
    mockGetOrder.mockImplementation(() => Promise.reject('Pretend the order does not exist'))
  })

  test('[SUCCESS] Happy path', async () => {
    // GIVEN: An order that is authorized
    mockSingleOrders.mockReturnValue(true)

    // GIVEN: And a getTradeableOrderWithSignature that doesn't revert
    mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

    // WHEN: we poll
    const pollResult = await SINGLE_ORDER.poll(param)

    // THEN: we expect a CALL to getTradeableOrderWithSignature with the owner, params, off-chain input, and no-proof
    expect(mockGetTradeableOrderWithSignature).toBeCalledTimes(1)
    expect(mockGetTradeableOrderWithSignature.mock.calls[0]).toEqual([
      OWNER,
      SINGLE_ORDER.leaf,
      SINGLE_ORDER.offChainInput,
      [],
    ])

    // THEN: We expect a SUCCESS result, which returns the order and the signature
    expect(pollResult).toEqual({
      result: PollResultCode.SUCCESS,
      order: DISCRETE_ORDER,
      signature,
    })
  })

  test('[DONT_TRY_AGAIN] Not authorized', async () => {
    // GIVEN: An order that is not authorized
    mockSingleOrders.mockReturnValue(false)

    // GIVEN: And a getTradeableOrderWithSignature that doesn't revert
    mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

    // WHEN: we poll
    const pollResult = await SINGLE_ORDER.poll(param)

    // THEN: We expect an error. We shouldn't try again
    expect(pollResult).toEqual({
      result: PollResultCode.DONT_TRY_AGAIN,
      reason:
        'NotAuthorized: Order 0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3 is not authorized for 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 on chain 1',
    })
  })

  test('[DONT_TRY_AGAIN] Invalid Conditional Order: Concrete order validation fails', async () => {
    // GIVEN: The concrete order implementation is not valid
    const order = createTestConditionalOrder()
    const mockIsValid = jest.fn(order.isValid).mockReturnValue({ isValid: false, reason: ERROR_REASON })
    order.isValid = mockIsValid

    // GIVEN: Everything else is OK (auth + contract returns an order)
    mockSingleOrders.mockReturnValue(true)
    mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

    // WHEN: we poll
    const pollResult = await order.poll(param)

    // THEN: we expect no CALLs to the contract
    expect(mockGetTradeableOrderWithSignature).toBeCalledTimes(0)

    // THEN: We to fail the validation, and to instruct to not try again
    expect(pollResult).toEqual({
      result: PollResultCode.DONT_TRY_AGAIN,
      reason: 'InvalidConditionalOrder. Reason: ' + ERROR_REASON,
    })
  })

  test('[UNEXPECTED_ERROR] getTradeableOrderWithSignature throws an error', async () => {
    // GIVEN: getTradeableOrderWithSignature throws
    const error = new Error(`I'm sorry, but is not a good time to trade`)
    mockGetTradeableOrderWithSignature.mockImplementation(() => {
      throw error
    })

    // GIVEN: Every validation is OK (auth + contract returns an order + order is valid)
    const order = createTestConditionalOrder()
    const mockIsValid = jest.fn(order.isValid).mockReturnValue({ isValid: true })
    order.isValid = mockIsValid
    mockSingleOrders.mockReturnValue(true)

    // WHEN: we poll
    const pollResult = await order.poll(param)

    // THEN: we expect 1 CALL to the
    expect(mockGetTradeableOrderWithSignature).toBeCalledTimes(1)

    // THEN: We receive an unexpected error
    expect(pollResult).toEqual({
      result: PollResultCode.UNEXPECTED_ERROR,
      error,
    })
  })

  async function testPollValidateResult(result: PollResultErrors | undefined | Error) {
    // GIVEN: The pollValidate returns undefined
    const order = new MockTestConditionalOrder(DEFAULT_ORDER_PARAMS)
    const isSuccess = result == undefined
    const isUnhandledError = result instanceof Error

    if (isUnhandledError) {
      // Pretend pollValidate throws an error
      mockPollValidate.mockImplementation(() => {
        throw result
      })
    } else {
      // Pretend pollValidate returns a result
      mockPollValidate.mockReturnValue(Promise.resolve(result))
    }

    // GIVEN: Everything else is OK (auth + contract returns an order)
    mockSingleOrders.mockReturnValue(true)
    mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

    // WHEN: we poll
    const pollResult = await order.poll(param)

    // THEN: we expect no CALLs to the
    expect(mockGetTradeableOrderWithSignature).toBeCalledTimes(isSuccess ? 1 : 0)

    if (isUnhandledError) {
      // THEN: We expect an error
      expect(pollResult).toEqual({
        result: PollResultCode.UNEXPECTED_ERROR,
        error: result,
      })
    } else if (isSuccess) {
      // THEN: We expect a SUCCESS result (which returns the order and the signature)
      expect(pollResult).toEqual({
        result: PollResultCode.SUCCESS,
        order: DISCRETE_ORDER,
        signature,
      })
    } else {
      // THEN: We expect the result from pollValidate
      expect(pollResult).toEqual(result)
    }
  }

  test('[pollValidate::SUCCESS] Return success when pollValidate returns undefined', async () => {
    testPollValidateResult(undefined)
  })

  test(`[pollValidate::DONT_TRY_AGAIN] Don't try again when pollValidate says so`, async () => {
    testPollValidateResult({
      result: PollResultCode.DONT_TRY_AGAIN,
      reason: ERROR_REASON,
    })
  })

  test(`[pollValidate::TRY_AT_EPOCH] Try on an specific epoch when pollValidate says so`, async () => {
    testPollValidateResult({
      result: PollResultCode.TRY_AT_EPOCH,
      epoch: 1234567890,
      reason: ERROR_REASON,
    })
  })

  test(`[pollValidate::TRY_NEXT_BLOCK] Try on next block when pollValidate says so`, async () => {
    testPollValidateResult({
      result: PollResultCode.TRY_NEXT_BLOCK,
      reason: 'Not valid, because I say so!',
    })
  })

  test(`[pollValidate::TRY_ON_BLOCK] Try on an specific block when pollValidate says so`, async () => {
    testPollValidateResult({
      result: PollResultCode.TRY_ON_BLOCK,
      blockNumber: 1234567890,
      reason: ERROR_REASON,
    })
  })

  test(`[pollValidate::UNEXPECTED_ERROR] Return an unexpected error when pollValidate throws`, async () => {
    testPollValidateResult(new Error(`There was an unexpected error while polling`))
  })

  test('[TRY_NEXT_BLOCK] When the order is already in the Orderbook', async () => {
    // GIVEN: All validations are OK, and getTradeableOrderWithSignature returns a valid order
    mockPollValidate.mockReturnValue(Promise.resolve(undefined))
    mockSingleOrders.mockReturnValue(true)
    mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

    // GIVEN: This order "orderUid" is a specific one
    const orderUid =
      '0x69b7bedc70cf0f13900a369772c6195483830590b09678dc4776bc45bf7f382b79063d9173c09887d536924e2f6eadbabac099f5648998c5'
    mockComputeOrderUid.mockReturnValue(Promise.resolve(orderUid))

    // GIVEN: the API finds the order in the orderbook
    mockGetOrder.mockImplementation(() => Promise.resolve({}))

    // WHEN: we poll
    const pollResult = await SINGLE_ORDER.poll(param)

    // THEN: we expect a call to compute the OrderUid with the right params
    expect(mockComputeOrderUid).toBeCalledTimes(1)
    expect(mockComputeOrderUid.mock.calls[0]).toEqual([param.chainId, param.owner, DISCRETE_ORDER])

    // THEN: we expect a call to the Orderbook API's getOrder function
    expect(mockGetOrder).toBeCalledTimes(1)
    expect(mockGetOrder.mock.calls[0]).toEqual([orderUid])

    // THEN: we expect the result to be
    expect(pollResult).toEqual({
      result: PollResultCode.TRY_NEXT_BLOCK,
      reason: 'Order already in orderbook',
    })
  })
})
