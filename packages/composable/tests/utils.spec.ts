import { decodeParams, encodeParams, fromStructToOrder, isValidAbi } from '../src/utils'
import { DurationType, StartTimeValue, TwapData, TwapStruct, transformDataToStruct } from '../src/orderTypes/Twap'
import { GPv2Order } from '../src/types'
import { createAdapters } from './setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

describe('Utils Functions - Multi-Adapter Tests', () => {
  let adapters: ReturnType<typeof createAdapters>

  // Test data
  const TWAP_PARAMS_TEST: TwapData = {
    sellToken: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
    buyToken: '0xDAE5F1590db13E3B40423B5b5c5fbf175515910b',
    receiver: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
    sellAmount: BigInt('1000000000000000000'), // 1ETH
    buyAmount: BigInt('1000000000000000000'), // 1ETH
    timeBetweenParts: BigInt(60 * 60),
    numberOfParts: BigInt(10),
    durationOfPart: {
      durationType: DurationType.AUTO,
    },
    startTime: {
      startType: StartTimeValue.AT_MINING_TIME,
    },
    appData: '0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5',
  }

  const TWAP_STRUCT_ABI = [
    {
      type: 'tuple',
      components: [
        { name: 'sellToken', type: 'address' },
        { name: 'buyToken', type: 'address' },
        { name: 'receiver', type: 'address' },
        { name: 'partSellAmount', type: 'uint256' },
        { name: 'minPartLimit', type: 'uint256' },
        { name: 't0', type: 'uint256' },
        { name: 'n', type: 'uint256' },
        { name: 't', type: 'uint256' },
        { name: 'span', type: 'uint256' },
        { name: 'appData', type: 'bytes32' },
      ],
    },
  ]

  const CONDITIONAL_ORDER_PARAMS = {
    handler: '0x6cF1e9cA41f7611dEf408122793c358a3d11E5a5',
    salt: '0x60864964e82f232a1a5bfada34d8bb0fdc73b0642be4a4086eb55176654db064',
    staticInput:
      '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000006cf1e9ca41f7611def408122793c358a3d11e5a560864964e82f232a1a5bfada34d8bb0fdc73b0642be4a4086eb55176654db064000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001400000000000000000000000006810e776880c02933d47db1b9fc05908e5386b96000000000000000000000000dae5f1590db13e3b40423b5b5c5fbf175515910b000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000016345785d8a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000e100000000000000000000000000000000000000000000000000000000000000000d51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5',
  }

  const ABI_ENCODED_ORDER =
    '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000006cf1e9ca41f7611def408122793c358a3d11e5a560864964e82f232a1a5bfada34d8bb0fdc73b0642be4a4086eb55176654db064000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000000200000000000000000000000006cf1e9ca41f7611def408122793c358a3d11e5a560864964e82f232a1a5bfada34d8bb0fdc73b0642be4a4086eb55176654db064000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001400000000000000000000000006810e776880c02933d47db1b9fc05908e5386b96000000000000000000000000dae5f1590db13e3b40423b5b5c5fbf175515910b000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000016345785d8a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000e100000000000000000000000000000000000000000000000000000000000000000d51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5'

  const TWAP_STRUCT: TwapStruct = transformDataToStruct(TWAP_PARAMS_TEST)

  const ORDER_DATA: GPv2Order.DataStruct = {
    sellToken: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
    buyToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    receiver: '0x50736F4707eD0c7bae86bd801d65377BB3739550',
    sellAmount: BigInt('497154622979742700000'),
    buyAmount: BigInt('26618938443780026000'),
    validTo: 1698723209,
    appData: '0x7cc001e5e82772cf4262f2836ae90e1844d2c12ad2fbc346f27a76f5d1cc9d39',
    feeAmount: BigInt(0),
    kind: '0xf3b277728b3fee749481eb3e0b3b48980dbbab78658fc419025cb16eee346775',
    partiallyFillable: false,
    sellTokenBalance: '0x5a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc9',
    buyTokenBalance: '0x5a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc9',
  }

  beforeAll(() => {
    adapters = createAdapters()
  })

  describe('encodeParams', () => {
    test('should fail if invalid params across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const invalidParams = { handler: '0xdeadbeef', salt: '0x', staticInput: '0x' }

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        expect(() => encodeParams(invalidParams)).toThrow()
      }
    })

    test('should encode params consistently across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const encodedResults: string[] = []

      // Encode with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const encoded = encodeParams(CONDITIONAL_ORDER_PARAMS)
        encodedResults.push(encoded)
      }

      // All encoded results should be identical
      const [firstEncoded, ...remainingEncoded] = encodedResults
      remainingEncoded.forEach((encoded) => {
        expect(encoded).toEqual(firstEncoded)
      })

      // Verify the result matches expected value
      expect(firstEncoded).toEqual(ABI_ENCODED_ORDER)
    })
  })

  describe('decodeParams', () => {
    test('should fail if invalid params across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        expect(() => decodeParams('0x')).toThrow()
      }
    })

    test('should decode params consistently across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const decodedResults: any[] = []

      // Decode with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const decoded = decodeParams(ABI_ENCODED_ORDER)
        decodedResults.push(decoded)
      }

      // All decoded results should be identical
      const [firstDecoded, ...remainingDecoded] = decodedResults
      remainingDecoded.forEach((decoded) => {
        expect(decoded).toEqual(firstDecoded)
      })

      // Verify the result matches expected value
      expect(firstDecoded).toEqual(CONDITIONAL_ORDER_PARAMS)
    })
  })

  describe('isValidAbi', () => {
    test('should return false for invalid params across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const invalidResults: boolean[] = []

      // Test with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = isValidAbi(TWAP_STRUCT_ABI, ['0x0'])
        invalidResults.push(result)
      }

      // All results should be false and identical
      const [firstResult, ...remainingResults] = invalidResults
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual(false)
    })

    test('should return true for valid params across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const validResults: boolean[] = []

      // Test with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = isValidAbi(TWAP_STRUCT_ABI, [TWAP_STRUCT])
        validResults.push(result)
      }

      // All results should be true and identical
      const [firstResult, ...remainingResults] = validResults
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual(true)
    })
  })

  describe('fromStructToOrder', () => {
    test('should convert struct to order consistently across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const conversionResults: any[] = []

      // Convert with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const order = fromStructToOrder(ORDER_DATA)
        conversionResults.push(order)
      }

      // All conversion results should be identical
      const [firstOrder, ...remainingOrders] = conversionResults
      remainingOrders.forEach((order) => {
        expect(order).toEqual(firstOrder)
      })

      // Verify the result matches expected structure
      const expectedOrder = {
        ...ORDER_DATA,
        kind: 'sell',
        sellTokenBalance: 'erc20',
        buyTokenBalance: 'erc20',
      }

      expect(firstOrder).toEqual(expectedOrder)
    })
  })
})
