import {
  DEFAULT_ORDER_PARAMS,
  TestConditionalOrder,
  createTestConditionalOrder,
  type TestConditionalOrderParams,
} from '../src/orderTypes/test/TestConditionalOrder'
import { ConditionalOrder } from '../src/ConditionalOrder'
import { Twap, CURRENT_BLOCK_TIMESTAMP_FACTORY_ADDRESS } from '../src/orderTypes/Twap'
import { TWAP_PARAMS_TEST } from './Twap.spec'
import { ComposableCowFactoryAbi } from '../src/abis/ComposableCowFactoryAbi'

import { GPv2Order, OwnerContext, PollParams, PollResultCode, PollResultErrors } from '../src/types'
import { BuyTokenDestination, OrderBookApi, OrderKind, SellTokenSource } from '@cowprotocol/sdk-order-book'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from './setup'

import { computeOrderUid } from '@cowprotocol/sdk-contracts-ts'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'

jest.mock('@cowprotocol/sdk-contracts-ts', () => ({
  ...jest.requireActual('@cowprotocol/sdk-contracts-ts'),
  computeOrderUid: jest.fn(),
}))

const mockOrderBookApi = {
  getOrder: jest.fn(),
}

describe('ConditionalOrder - Multi-Adapter Tests', () => {
  let adapters: ReturnType<typeof createAdapters>

  // Test data
  const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  const ERROR_REASON = 'Not valid, because I say so!'

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

  const DISCRETE_ORDER: GPv2Order.DataStruct = {
    sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    sellAmount: BigInt('1234567890'),
    buyAmount: BigInt('1234567890'),
    validTo: 0,
    appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
    partiallyFillable: true,
    sellTokenBalance: SellTokenSource.ERC20,
    buyTokenBalance: BuyTokenDestination.ERC20,
    kind: OrderKind.BUY,
    feeAmount: BigInt('0'),
  }

  beforeAll(() => {
    adapters = createAdapters()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Constructor', () => {
    test('should create TestConditionalOrder across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const orders: TestConditionalOrder[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const order = createTestConditionalOrder()
        orders.push(order)
      }

      // All orders should be defined
      orders.forEach((order) => {
        expect(order).toBeDefined()
      })
    })

    test('should accept an adapter in the constructor', () => {
      const order = new TestConditionalOrder(DEFAULT_ORDER_PARAMS, adapters.ethersV5Adapter)

      expect(order.isValid().isValid).toBe(true)
    })

    test('should default optional constructor fields', () => {
      const order = new TestConditionalOrder({
        handler: DEFAULT_ORDER_PARAMS.handler,
      } as TestConditionalOrderParams)

      expect(order.encodeStaticInput()).toBe('0x')
      expect(order.isSingleOrder).toBe(true)
    })

    test('should allow overriding isSingleOrder', () => {
      const order = new TestConditionalOrder({
        handler: DEFAULT_ORDER_PARAMS.handler,
        data: DEFAULT_ORDER_PARAMS.data,
        isSingleOrder: false,
      })

      expect(order.isSingleOrder).toBe(false)
    })

    test('should fail with bad address across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        expect(() => createTestConditionalOrder({ handler: '0xdeadbeef' })).toThrow('Invalid handler: 0xdeadbeef')
      }
    })

    describe('Salt validation', () => {
      test('should fail if salt is not hex across all adapters', () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          expect(() =>
            createTestConditionalOrder({ handler: '0x910d00a310f7Dc5B29FE73458F47f519be547D3d', salt: 'cowtomoon' }),
          ).toThrow('Invalid salt: cowtomoon')
        }
      })

      test('should fail if salt is too short across all adapters', () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          expect(() =>
            createTestConditionalOrder({ handler: '0x910d00a310f7Dc5B29FE73458F47f519be547D3d', salt: '0xdeadbeef' }),
          ).toThrow('Invalid salt: 0xdeadbeef')
        }
      })

      test('should fail if salt is too long across all adapters', () => {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
        const longSalt =
          '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          expect(() =>
            createTestConditionalOrder({
              handler: '0x910d00a310f7Dc5B29FE73458F47f519be547D3d',
              salt: longSalt,
            }),
          ).toThrow(`Invalid salt: ${longSalt}`)
        }
      })
    })
  })

  describe('Deserialize: Decode static input', () => {
    test('should fail if handler mismatch across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        expect(() =>
          Twap.deserialize(
            TWAP_SERIALIZED(undefined, COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET]),
          ),
        ).toThrow('HandlerMismatch')
      }
    })
  })

  describe('Serialize: Encode static input', () => {
    test('should fail with wrong handler across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const order = createTestConditionalOrder({ handler: '0x910d00a310f7Dc5B29FE73458F47f519be547D3d' })
        expect(() => order.testEncodeStaticInput()).toThrow()
      }
    })
  })

  describe('Compute orderUid', () => {
    test('should return correct id across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const ids: string[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const order = createTestConditionalOrder()
        ids.push(order.id)
      }

      // All IDs should be identical
      const [firstId, ...remainingIds] = ids
      remainingIds.forEach((id) => {
        expect(id).toEqual(firstId)
      })

      expect(firstId).toEqual('0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3')
    })

    test('should derive OrderId from leaf data consistently across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const leafIds: string[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const order = createTestConditionalOrder()
        const leafId = ConditionalOrder.leafToId(order.leaf)
        leafIds.push(leafId)
      }

      // All leaf IDs should be identical
      const [firstLeafId, ...remainingLeafIds] = leafIds
      remainingLeafIds.forEach((leafId) => {
        expect(leafId).toEqual(firstLeafId)
      })

      expect(firstLeafId).toEqual('0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3')
    })
  })

  describe('Cabinet', () => {
    const cabinetValue = '000000000000000000000000000000000000000000000000000000064f0b353'
    const param = { owner: OWNER } as OwnerContext

    beforeEach(() => {
      jest.resetAllMocks()
    })

    test('should call contract with order id as ctx for single orders across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        //@ts-expect-error: function types are different across adapters
        jest.spyOn(adapters[adapterName], 'readContract').mockImplementation(async (params, provider) => {
          if (params.functionName === 'cabinet') {
            return cabinetValue
          }
          //@ts-expect-error: function types are different across adapters
          return adapters[adapterName].readContract(params, provider)
        })

        const singleOrder = createTestConditionalOrder()
        const result = await singleOrder.cabinet(param)
        expect(result).toEqual(cabinetValue)

        jest.restoreAllMocks()
      }
    })

    test('should call contract with 0x0 as ctx for merkle root orders across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        //@ts-expect-error: function types are different across adapters
        jest.spyOn(adapters[adapterName], 'readContract').mockImplementation(async (params, provider) => {
          if (params.functionName === 'cabinet') {
            return cabinetValue
          }
          //@ts-expect-error: function types are different across adapters
          return adapters[adapterName].readContract(params, provider)
        })

        const merkleRootOrder = createTestConditionalOrder({ isSingleOrder: false })
        const result = await merkleRootOrder.cabinet(param)
        expect(result).toEqual(cabinetValue)

        jest.restoreAllMocks()
      }
    })
  })

  describe('Poll Single Orders', () => {
    const mockSingleOrders = jest.fn()
    const mockGetTradeableOrderWithSignature = jest.fn()
    const chainId = 1
    const signature = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockPollValidate = jest.fn<Promise<PollResultErrors | undefined>, [params: PollParams], any>()

    class MockTestConditionalOrder extends TestConditionalOrder {
      protected pollValidate(params: PollParams): Promise<PollResultErrors | undefined> {
        return mockPollValidate(params)
      }
    }

    beforeEach(() => {
      jest.resetAllMocks()
      mockOrderBookApi.getOrder.mockImplementation(() => Promise.reject('Pretend the order does not exist'))
    })

    test('should return SUCCESS on happy path across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        // Reset mocks at the start of each iteration
        jest.clearAllMocks()

        setGlobalAdapter(adapters[adapterName])

        const param = {
          owner: OWNER,
          chainId,
          provider: {},
          orderBookApi: mockOrderBookApi as unknown as OrderBookApi,
        } as PollParams

        // Mock readContract for specific functions
        //@ts-expect-error: function types are different across adapters
        jest.spyOn(adapters[adapterName], 'readContract').mockImplementation(async (params, provider) => {
          if (params.functionName === 'getTradeableOrderWithSignature') {
            return mockGetTradeableOrderWithSignature()
          }
          if (params.functionName === 'singleOrders') {
            return mockSingleOrders()
          }
          //@ts-expect-error: function types are different across adapters
          return adapters[adapterName].readContract(params, provider)
        })

        const singleOrder = createTestConditionalOrder()

        // GIVEN: An order that is authorized
        mockSingleOrders.mockReturnValue(true)

        // GIVEN: And a getTradeableOrderWithSignature that doesn't revert
        mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

        // WHEN: we poll
        const pollResult = await singleOrder.poll(param)

        // THEN: we expect a CALL to getTradeableOrderWithSignature
        expect(mockGetTradeableOrderWithSignature).toHaveBeenCalledTimes(1)

        // THEN: We expect a SUCCESS result
        expect(pollResult).toEqual({
          result: PollResultCode.SUCCESS,
          order: DISCRETE_ORDER,
          signature,
        })

        jest.restoreAllMocks()
      }
    })

    test('should return DONT_TRY_AGAIN when not authorized across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const param = {
          owner: OWNER,
          chainId,
          provider: {},
          orderBookApi: mockOrderBookApi as unknown as OrderBookApi,
        } as PollParams

        // Mock readContract for specific functions
        //@ts-expect-error: function types are different across adapters
        jest.spyOn(adapters[adapterName], 'readContract').mockImplementation(async (params, provider) => {
          if (params.functionName === 'getTradeableOrderWithSignature') {
            return mockGetTradeableOrderWithSignature()
          }
          if (params.functionName === 'singleOrders') {
            return mockSingleOrders()
          }
          //@ts-expect-error: function types are different across adapters
          return adapters[adapterName].readContract(params, provider)
        })

        const singleOrder = createTestConditionalOrder()

        // GIVEN: An order that is not authorized
        mockSingleOrders.mockReturnValue(false)

        // GIVEN: And a getTradeableOrderWithSignature that doesn't revert
        mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

        // WHEN: we poll
        const pollResult = await singleOrder.poll(param)

        // THEN: We expect an error. We shouldn't try again
        expect(pollResult).toEqual({
          result: PollResultCode.DONT_TRY_AGAIN,
          reason:
            'NotAuthorized: Order 0x88ca0698d8c5500b31015d84fa0166272e1812320d9af8b60e29ae00153363b3 is not authorized for 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 on chain 1',
        })

        jest.restoreAllMocks()
      }
    })

    test('should return DONT_TRY_AGAIN for invalid conditional order across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const param = {
          owner: OWNER,
          chainId,
          provider: {},
          orderBookApi: mockOrderBookApi as unknown as OrderBookApi,
        } as PollParams

        // Mock readContract for specific functions
        //@ts-expect-error: function types are different across adapters
        jest.spyOn(adapters[adapterName], 'readContract').mockImplementation(async (params, provider) => {
          if (params.functionName === 'getTradeableOrderWithSignature') {
            return mockGetTradeableOrderWithSignature()
          }
          if (params.functionName === 'singleOrders') {
            return mockSingleOrders()
          }
          //@ts-expect-error: function types are different across adapters
          return adapters[adapterName].readContract(params, provider)
        })

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
        expect(mockGetTradeableOrderWithSignature).toHaveBeenCalledTimes(0)

        // THEN: We expect to fail the validation, and to instruct to not try again
        expect(pollResult).toEqual({
          result: PollResultCode.DONT_TRY_AGAIN,
          reason: 'InvalidConditionalOrder. Reason: ' + ERROR_REASON,
        })

        jest.restoreAllMocks()
      }
    })

    test('should return UNEXPECTED_ERROR when getTradeableOrderWithSignature throws across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const param = {
          owner: OWNER,
          chainId,
          provider: {},
          orderBookApi: mockOrderBookApi as unknown as OrderBookApi,
        } as PollParams

        // GIVEN: getTradeableOrderWithSignature throws
        const error = new Error(`I'm sorry, but is not a good time to trade`)

        // Mock readContract for specific functions
        //@ts-expect-error: function types are different across adapters
        jest.spyOn(adapters[adapterName], 'readContract').mockImplementation(async (params, provider) => {
          if (params.functionName === 'getTradeableOrderWithSignature') {
            throw error
          }
          if (params.functionName === 'singleOrders') {
            return mockSingleOrders()
          }
          //@ts-expect-error: function types are different across adapters
          return adapters[adapterName].readContract(params, provider)
        })

        // GIVEN: Every validation is OK (auth + contract returns an order + order is valid)
        const order = createTestConditionalOrder()
        const mockIsValid = jest.fn(order.isValid).mockReturnValue({ isValid: true })
        order.isValid = mockIsValid
        mockSingleOrders.mockReturnValue(true)

        // WHEN: we poll
        const pollResult = await order.poll(param)

        // THEN: We receive an unexpected error
        expect(pollResult).toEqual({
          result: PollResultCode.UNEXPECTED_ERROR,
          error,
        })

        jest.restoreAllMocks()
      }
    })

    async function testPollValidateResult(
      result: PollResultErrors | undefined | Error,
      adapterName: keyof typeof adapters,
    ) {
      // Reset mocks at the start of each iteration
      jest.clearAllMocks()

      setGlobalAdapter(adapters[adapterName])

      const param = {
        owner: OWNER,
        chainId,
        provider: {},
        orderBookApi: mockOrderBookApi as unknown as OrderBookApi,
      } as PollParams

      // Mock readContract for specific functions
      //@ts-expect-error: function types are different across adapters
      jest.spyOn(adapters[adapterName], 'readContract').mockImplementation(async (params, provider) => {
        if (params.functionName === 'getTradeableOrderWithSignature') {
          return mockGetTradeableOrderWithSignature()
        }
        if (params.functionName === 'singleOrders') {
          return mockSingleOrders()
        }
        //@ts-expect-error: function types are different across adapters
        return adapters[adapterName].readContract(params, provider)
      })

      // GIVEN: The pollValidate returns the specified result
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

      // THEN: we expect calls to contract based on success
      expect(mockGetTradeableOrderWithSignature).toBeCalledTimes(isSuccess ? 1 : 0)

      if (isUnhandledError) {
        // THEN: We expect an error
        expect(pollResult).toEqual({
          result: PollResultCode.UNEXPECTED_ERROR,
          error: result,
        })
      } else if (isSuccess) {
        // THEN: We expect a SUCCESS result
        expect(pollResult).toEqual({
          result: PollResultCode.SUCCESS,
          order: DISCRETE_ORDER,
          signature,
        })
      } else {
        // THEN: We expect the result from pollValidate
        expect(pollResult).toEqual(result)
      }

      jest.restoreAllMocks()
    }

    test('should return success when pollValidate returns undefined across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        await testPollValidateResult(undefined, adapterName)
      }
    })

    test(`should not try again when pollValidate says so across all adapters`, async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        await testPollValidateResult(
          {
            result: PollResultCode.DONT_TRY_AGAIN,
            reason: ERROR_REASON,
          },
          adapterName,
        )
      }
    })

    test(`should try at specific epoch when pollValidate says so across all adapters`, async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        await testPollValidateResult(
          {
            result: PollResultCode.TRY_AT_EPOCH,
            epoch: 1234567890,
            reason: ERROR_REASON,
          },
          adapterName,
        )
      }
    })

    test(`should try next block when pollValidate says so across all adapters`, async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        await testPollValidateResult(
          {
            result: PollResultCode.TRY_NEXT_BLOCK,
            reason: ERROR_REASON,
          },
          adapterName,
        )
      }
    })

    test(`should try on specific block when pollValidate says so across all adapters`, async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        await testPollValidateResult(
          {
            result: PollResultCode.TRY_ON_BLOCK,
            blockNumber: 1234567890,
            reason: ERROR_REASON,
          },
          adapterName,
        )
      }
    })

    test(`should return unexpected error when pollValidate throws across all adapters`, async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        await testPollValidateResult(new Error(`There was an unexpected error while polling`), adapterName)
      }
    })

    test('should return TRY_NEXT_BLOCK when order is already in orderbook across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        // Reset mocks at the start of each iteration
        jest.clearAllMocks()

        setGlobalAdapter(adapters[adapterName])

        const param = {
          owner: OWNER,
          chainId,
          provider: {},
          orderBookApi: mockOrderBookApi as unknown as OrderBookApi,
        } as PollParams

        // Mock readContract for specific functions
        //@ts-expect-error: function types are different across adapters
        jest.spyOn(adapters[adapterName], 'readContract').mockImplementation(async (params, provider) => {
          if (params.functionName === 'getTradeableOrderWithSignature') {
            return mockGetTradeableOrderWithSignature()
          }
          if (params.functionName === 'singleOrders') {
            return mockSingleOrders()
          }
          //@ts-expect-error: function types are different across adapters
          return adapters[adapterName].readContract(params, provider)
        })

        const singleOrder = createTestConditionalOrder()

        // GIVEN: All validations are OK
        mockPollValidate.mockReturnValue(Promise.resolve(undefined))
        mockSingleOrders.mockReturnValue(true)
        mockGetTradeableOrderWithSignature.mockReturnValue([DISCRETE_ORDER, signature])

        // GIVEN: This order "orderUid" is a specific one
        const orderUid =
          '0x69b7bedc70cf0f13900a369772c6195483830590b09678dc4776bc45bf7f382b79063d9173c09887d536924e2f6eadbabac099f5648998c5'

        const mockComputeOrderUid = computeOrderUid as jest.MockedFunction<typeof computeOrderUid>
        mockComputeOrderUid.mockReturnValue(orderUid)

        // GIVEN: the API finds the order in the orderbook
        mockOrderBookApi.getOrder.mockImplementation(() => Promise.resolve({}))

        // WHEN: we poll
        const pollResult = await singleOrder.poll(param)

        // THEN: we expect a call to compute the OrderUid
        expect(mockComputeOrderUid).toHaveBeenCalledTimes(1)

        // THEN: we expect a call to the Orderbook API's getOrder function
        expect(mockOrderBookApi.getOrder).toHaveBeenCalledTimes(1)

        // THEN: we expect the result to be TRY_NEXT_BLOCK
        expect(pollResult).toEqual({
          result: PollResultCode.TRY_NEXT_BLOCK,
          reason: 'Order already in orderbook',
        })

        jest.restoreAllMocks()
      }
    })

    test('should return handlePollFailedAlreadyPresent result when order is already in orderbook', async () => {
      setGlobalAdapter(adapters.viemAdapter)

      class OrderInBookOrder extends TestConditionalOrder {
        protected handlePollFailedAlreadyPresent(): Promise<PollResultErrors> {
          return Promise.resolve({
            result: PollResultCode.TRY_AT_EPOCH,
            epoch: 1_800_000_000,
            reason: 'Handled by order type',
          })
        }
      }

      const param = {
        owner: OWNER,
        chainId: 1,
        provider: {},
        orderBookApi: mockOrderBookApi as unknown as OrderBookApi,
      } as PollParams

      jest.spyOn(adapters.viemAdapter, 'readContract').mockImplementation(async (params) => {
        if (params.functionName === 'getTradeableOrderWithSignature') {
          return [DISCRETE_ORDER, signature]
        }
        if (params.functionName === 'singleOrders') {
          return true
        }
        throw new Error(`Unexpected call: ${params.functionName}`)
      })

      const order = new OrderInBookOrder(DEFAULT_ORDER_PARAMS)
      mockOrderBookApi.getOrder.mockResolvedValue({})

      const pollResult = await order.poll(param)

      expect(pollResult).toEqual({
        result: PollResultCode.TRY_AT_EPOCH,
        epoch: 1_800_000_000,
        reason: 'Handled by order type',
      })

      jest.restoreAllMocks()
    })
  })

  describe('calldata helpers', () => {
    function decodeCalldata(functionName: 'create' | 'createWithContext' | 'remove', calldata: string) {
      return adapters.viemAdapter.utils.decodeFunctionData(ComposableCowFactoryAbi as any, functionName, calldata)
    }

    function expectFunctionSelector(functionName: 'create' | 'createWithContext' | 'remove', calldata: string) {
      const selector = adapters.viemAdapter.utils.id(`${functionName}((address,bytes32,bytes),bool)`).slice(0, 10)

      if (functionName === 'createWithContext') {
        expect(calldata.slice(0, 10)).toBe(
          adapters.viemAdapter.utils.id(`${functionName}((address,bytes32,bytes),address,bytes,bool)`).slice(0, 10),
        )
        return
      }

      if (functionName === 'remove') {
        expect(calldata.slice(0, 10)).toBe(adapters.viemAdapter.utils.id('remove(bytes32)').slice(0, 10))
        return
      }

      expect(calldata.slice(0, 10)).toBe(selector)
    }

    test('should encode create and remove calldata for valid orders', () => {
      setGlobalAdapter(adapters.viemAdapter)

      const order = createTestConditionalOrder()
      const createCalldata = order.createCalldata
      const removeCalldata = order.removeCalldata

      expectFunctionSelector('create', createCalldata)
      expectFunctionSelector('remove', removeCalldata)

      const [params, dispatch] = decodeCalldata('create', createCalldata) as [
        { handler: string; salt: string; staticInput: string },
        boolean,
      ]
      const [orderId] = decodeCalldata('remove', removeCalldata) as [string]

      expect(params).toEqual({
        handler: order.handler,
        salt: order.salt,
        staticInput: order.encodeStaticInput(),
      })
      expect(dispatch).toBe(true)
      expect(orderId).toBe(order.id)
    })

    test('should encode createWithContext calldata when context has no factory args', () => {
      setGlobalAdapter(adapters.viemAdapter)

      const twap = Twap.fromData(TWAP_PARAMS_TEST)
      const createCalldata = twap.createCalldata

      expectFunctionSelector('createWithContext', createCalldata)

      const [params, factory, factoryData, dispatch] = decodeCalldata('createWithContext', createCalldata) as [
        { handler: string; salt: string; staticInput: string },
        string,
        `0x${string}`,
        boolean,
      ]

      expect(params).toEqual({
        handler: twap.handler,
        salt: twap.salt,
        staticInput: twap.encodeStaticInput(),
      })
      expect(factory).toBe(CURRENT_BLOCK_TIMESTAMP_FACTORY_ADDRESS)
      expect(factoryData).toBe('0x')
      expect(dispatch).toBe(true)
    })

    test('should encode createWithContext calldata when an order has context', () => {
      setGlobalAdapter(adapters.viemAdapter)

      class ContextOrder extends TestConditionalOrder {
        get context() {
          return {
            address: '0x52eD56Da04309Aca4c3FECC595298d80C2f16BAc',
            factoryArgs: {
              argsType: ['uint256'],
              args: [42n],
            },
          }
        }
      }

      const order = new ContextOrder(DEFAULT_ORDER_PARAMS)
      const createCalldata = order.createCalldata

      expectFunctionSelector('createWithContext', createCalldata)

      const [params, factory, factoryData, dispatch] = decodeCalldata('createWithContext', createCalldata) as [
        { handler: string; salt: string; staticInput: string },
        string,
        `0x${string}`,
        boolean,
      ]

      expect(params).toEqual({
        handler: order.handler,
        salt: order.salt,
        staticInput: order.encodeStaticInput(),
      })
      expect(factory).toBe('0x52eD56Da04309Aca4c3FECC595298d80C2f16BAc')
      expect(adapters.viemAdapter.utils.decodeAbi(['uint256'], factoryData as `0x${string}`)[0]).toBe(42n)
      expect(dispatch).toBe(true)
    })

    test('should throw when generating calldata for invalid orders', () => {
      setGlobalAdapter(adapters.viemAdapter)

      class InvalidOrder extends TestConditionalOrder {
        isValid() {
          return { isValid: false, reason: 'Nope' }
        }
      }

      const order = new InvalidOrder(DEFAULT_ORDER_PARAMS)

      expect(() => order.createCalldata).toThrow('Invalid order: Nope')
      expect(() => order.removeCalldata).toThrow('Invalid order: Nope')
    })
  })

  describe('TestConditionalOrder helpers', () => {
    test('should expose order type and helper methods', () => {
      setGlobalAdapter(adapters.viemAdapter)

      const order = createTestConditionalOrder()

      expect(order.orderType).toBe('TEST')
      expect(order.encodeStaticInput()).toBe(DEFAULT_ORDER_PARAMS.data)
      expect(order.transformStructToData('0x01')).toBe('0x01')
      expect(order.transformDataToStruct('0x02')).toBe('0x02')
    })

    test('should throw from toString until implemented', () => {
      setGlobalAdapter(adapters.viemAdapter)

      expect(() => createTestConditionalOrder().toString()).toThrow('Method not implemented.')
    })
  })
})
