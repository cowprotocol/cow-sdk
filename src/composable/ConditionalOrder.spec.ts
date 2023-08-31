import { TestConditionalOrder } from './orderTypes/test/TestConditionalOrder'
import { ConditionalOrder } from './ConditionalOrder'
import { Twap } from './orderTypes/Twap'

import { getComposableCow } from './contracts'
import { constants } from 'ethers'
import { OwnerContext, PollParams, PollResultCode } from './types'
import { BuyTokenDestination, OrderKind, SellTokenSource } from '../order-book/generated'

jest.mock('./contracts')
const mockGetComposableCow = getComposableCow as jest.MockedFunction<typeof getComposableCow>

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

const createOrder = (isSingleOrder = true) =>
  new TestConditionalOrder(
    '0x910d00a310f7Dc5B29FE73458F47f519be547D3d',
    '0x9379a0bf532ff9a66ffde940f94b1a025d6f18803054c1aef52dc94b15255bbe',
    '0x',
    isSingleOrder
  )

const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const SINGLE_ORDER = createOrder()
const MERKLE_ROOT_ORDER = createOrder(false)
const DISCRETE_ORDER = {
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
  from: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  kind: OrderKind.BUY,
  class: 'market',
}

describe('Constructor', () => {
  test('Create TestConditionalOrder', () => {
    // bad address
    expect(() => new TestConditionalOrder('0xdeadbeef')).toThrow('Invalid handler: 0xdeadbeef')
  })

  test('Fail if bad address', () => {
    // bad address
    expect(() => new TestConditionalOrder('0xdeadbeef')).toThrow('Invalid handler: 0xdeadbeef')
  })

  describe('Fail if bad salt', () => {
    test('Fails if salt is not an hex', () => {
      expect(() => new TestConditionalOrder('0x910d00a310f7Dc5B29FE73458F47f519be547D3d', 'cowtomoon')).toThrow(
        'Invalid salt: cowtomoon'
      )
    })

    test('Fails if salt is too short (not 32 bytes)', () => {
      expect(() => new TestConditionalOrder('0x910d00a310f7Dc5B29FE73458F47f519be547D3d', '0xdeadbeef')).toThrow(
        'Invalid salt: 0xdeadbeef'
      )
    })

    test('Fails if salt is too long (not 32 bytes)', () => {
      expect(
        () =>
          new TestConditionalOrder(
            '0x910d00a310f7Dc5B29FE73458F47f519be547D3d',
            '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
          )
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
  test('Serialize: Fails if invalid params', () => {
    const order = new TestConditionalOrder('0x910d00a310f7Dc5B29FE73458F47f519be547D3d')
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
  const param = { owner: OWNER, chainId: 1, provider: {} } as PollParams

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
  })

  test.only('[SUCCESS] Happy path', async () => {
    // GIVEN: An order that is authorised
    mockSingleOrders.mockReturnValue(true)

    // GIVEN: And a getTradeableOrderWithSignature that doesn't revert
    mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

    // When we poll
    const pollResult = await SINGLE_ORDER.poll(param)

    // THEN: we expect a CALL to getTradeableOrderWithSignature with the owner, params, off-chain input, and no-proof
    expect(mockGetTradeableOrderWithSignature.mock.calls).toHaveLength(1)
    expect(mockGetTradeableOrderWithSignature.mock.calls[0]).toEqual([
      OWNER,
      SINGLE_ORDER.leaf,
      SINGLE_ORDER.offChainInput,
      [],
    ])

    // THEN: We expect a SUCCESS result, which returns the order and the signature
    pollResult.result === PollResultCode.UNEXPECTED_ERROR && console.error(pollResult.error)
    expect(pollResult).toEqual({
      result: PollResultCode.SUCCESS,
      order: DISCRETE_ORDER,
      signature,
    })
  })

  test.only('[DONT_TRY_AGAIN] Not authorised', async () => {
    // GIVEN: An order that is authorised
    mockSingleOrders.mockReturnValue(false)

    // GIVEN: And a getTradeableOrderWithSignature that doesn't revert
    mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

    // When we poll
    const pollResult = await SINGLE_ORDER.poll(param)

    // THEN: We expect a SUCCESS result, which returns the order and the signature
    pollResult.result === PollResultCode.UNEXPECTED_ERROR && console.error(pollResult.error)
    expect(pollResult).toEqual({
      result: PollResultCode.DONT_TRY_AGAIN,
      reason:
        'NotAuthorised: Order 0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3 is not authorised for 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 on chain 1',
    })
  })
})
