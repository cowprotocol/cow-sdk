import { Block, getGlobalAdapter, Provider, setGlobalAdapter, ZERO_ADDRESS } from '@cowprotocol/sdk-common'
import { GPv2Order, OwnerContext, PollParams, PollResultCode, PollResultErrors } from '../src/types'
import { DurationType, StartTimeValue, Twap, TWAP_ADDRESS, TwapData } from '../src/orderTypes/Twap'

import { createAdapters } from './setup'

export const TWAP_PARAMS_TEST: TwapData = {
  sellToken: '0x6810e776880C02933D47DB1b9fc05908e5386b96',
  buyToken: '0xDAE5F1590db13E3B40423B5b5c5fbf175515910b',
  receiver: '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
  sellAmount: BigInt('1000000000000000000'), // 1 ETH
  buyAmount: BigInt('1000000000000000000'), // 1 ETH
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

describe('TWAP Order - Multi-Adapter Tests', () => {
  let adapters: ReturnType<typeof createAdapters>

  // Test data
  const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

  const SALT = '0xd98a87ed4e45bfeae3f779e1ac09ceacdfb57da214c7fffa6434aeb969f396c0'
  const SALT_2 = '0xd98a87ed4e45bfeae3f779e1ac09ceacdfb57da214c7fffa6434aeb969f396c1'
  const TWAP_ID = '0xd8a6889486a47d8ca8f4189f11573b39dbc04f605719ebf4050e44ae53c1bedf'
  const TWAP_ID_2 = '0x8ddb7e8e1cd6a06d5bb6f91af21a2b26a433a5d8402ccddb00a72e4006c46994'

  const TWAP_SERIALIZED = (salt?: string): string => {
    return (
      '0x' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '000000000000000000000000' +
      TWAP_ADDRESS.substring(2).toLowerCase() +
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

  beforeAll(() => {
    adapters = createAdapters()
  })

  describe('Constructor', () => {
    test('should create new valid TWAP across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const twapInstances: Twap[] = []

      // Create TWAP with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new Twap({ handler: TWAP_ADDRESS, data: TWAP_PARAMS_TEST })
        twapInstances.push(twap)
      }

      // All instances should have consistent properties
      const [firstTwap, ...remainingTwaps] = twapInstances
      remainingTwaps.forEach((twap) => {
        expect(twap.orderType).toEqual(firstTwap.orderType)
        expect(twap.hasOffChainInput).toEqual(firstTwap.hasOffChainInput)
        expect(twap.offChainInput).toEqual(firstTwap.offChainInput)
        expect(twap.context?.address).toEqual(firstTwap.context?.address)
      })

      // Verify common properties
      expect(firstTwap.orderType).toEqual('twap')
      expect(firstTwap.hasOffChainInput).toEqual(false)
      expect(firstTwap.offChainInput).toEqual('0x')
      expect(firstTwap.context?.address).not.toBeUndefined()
    })

    test('should throw for invalid handler across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const invalidHandler = '0xdeaddeaddeaddeaddeaddeaddeaddeaddeaddead'

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        expect(() => new Twap({ handler: invalidHandler, data: TWAP_PARAMS_TEST })).toThrow('InvalidHandler')
      }
    })
  })

  describe('Twap.fromData', () => {
    test('should create valid TWAP with start at mining time across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const twapInstances: Twap[] = []

      // Create TWAP with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData(TWAP_PARAMS_TEST)
        twapInstances.push(twap)
      }

      // All instances should have consistent properties
      const [firstTwap, ...remainingTwaps] = twapInstances
      remainingTwaps.forEach((twap) => {
        expect(twap.orderType).toEqual(firstTwap.orderType)
        expect(twap.hasOffChainInput).toEqual(firstTwap.hasOffChainInput)
        expect(twap.offChainInput).toEqual(firstTwap.offChainInput)
        expect(twap.context?.address).toEqual(firstTwap.context?.address)
      })

      // Verify common properties
      expect(firstTwap.orderType).toEqual('twap')
      expect(firstTwap.hasOffChainInput).toEqual(false)
      expect(firstTwap.offChainInput).toEqual('0x')
      expect(firstTwap.context?.address).not.toBeUndefined()
    })

    test('should create valid TWAP with start at epoch across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const twapInstances: Twap[] = []

      const paramsWithEpoch = {
        ...TWAP_PARAMS_TEST,
        startTime: { startType: StartTimeValue.AT_EPOCH, epoch: BigInt(1) },
      }

      // Create TWAP with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData(paramsWithEpoch)
        twapInstances.push(twap)
      }

      // All instances should have consistent properties
      const [firstTwap, ...remainingTwaps] = twapInstances
      remainingTwaps.forEach((twap) => {
        expect(twap.context).toEqual(firstTwap.context)
      })

      expect(firstTwap.context).toBeUndefined()
    })
  })

  describe('Id', () => {
    test('should compute ID correctly across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const ids: string[] = []

      // Compute ID with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT)
        ids.push(twap.id)
      }

      // All IDs should be identical
      const [firstId, ...remainingIds] = ids
      remainingIds.forEach((id) => {
        expect(id).toEqual(firstId)
      })

      expect(firstId).toEqual(TWAP_ID)
    })

    test('should not change ID for same params and salt across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap1 = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT)
        const twap2 = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT)

        expect(twap1.id).toEqual(twap2.id)
      }
    })

    test('should change ID for same params and different salt across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const twap1Ids: string[] = []
      const twap2Ids: string[] = []

      // Generate IDs with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap1 = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT)
        const twap2 = Twap.fromData({ ...TWAP_PARAMS_TEST }, SALT_2)
        twap1Ids.push(twap1.id)
        twap2Ids.push(twap2.id)
      }

      // All twap1 IDs should be identical, all twap2 IDs should be identical
      const [firstTwap1Id, ...remainingTwap1Ids] = twap1Ids
      const [firstTwap2Id, ...remainingTwap2Ids] = twap2Ids

      remainingTwap1Ids.forEach((id) => expect(id).toEqual(firstTwap1Id))
      remainingTwap2Ids.forEach((id) => expect(id).toEqual(firstTwap2Id))

      // But twap1 and twap2 IDs should be different
      expect(firstTwap1Id).not.toEqual(firstTwap2Id)
      expect(firstTwap2Id).toEqual(TWAP_ID_2)
    })

    test('should change ID for different params and same salt across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const ids: string[] = []

      const modifiedParams = {
        ...TWAP_PARAMS_TEST,
        startTime: { startType: StartTimeValue.AT_EPOCH, epoch: BigInt(123456789) },
      }

      // Generate IDs with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData(modifiedParams, SALT)
        ids.push(twap.id)
      }

      // All IDs should be identical
      const [firstId, ...remainingIds] = ids
      remainingIds.forEach((id) => {
        expect(id).toEqual(firstId)
      })

      expect(firstId).toEqual('0xe993544057dbc8504c4e38a6fe35845a81e0849c11242a6070f9d25152598df6')
    })
  })

  describe('Validate', () => {
    test('should validate valid twap across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({ ...TWAP_PARAMS_TEST }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({ isValid: true })
    })

    test('should invalidate same token across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({ ...TWAP_PARAMS_TEST, sellToken: TWAP_PARAMS_TEST.buyToken }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidSameToken',
      })
    })

    test('should invalidate zero sell token across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({ ...TWAP_PARAMS_TEST, sellToken: ZERO_ADDRESS }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidToken',
      })
    })

    test('should invalidate zero buy token across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({ ...TWAP_PARAMS_TEST, buyToken: ZERO_ADDRESS }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidToken',
      })
    })

    test('should invalidate zero sell amount across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({ ...TWAP_PARAMS_TEST, sellAmount: BigInt(0) }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidSellAmount',
      })
    })

    test('should invalidate zero buy amount across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({ ...TWAP_PARAMS_TEST, buyAmount: BigInt(0) }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidMinBuyAmount',
      })
    })

    test('should invalidate negative start time across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({
          ...TWAP_PARAMS_TEST,
          startTime: { startType: StartTimeValue.AT_EPOCH, epoch: BigInt(-1) },
        }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidStartTime',
      })
    })

    test('should invalidate zero number of parts across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({ ...TWAP_PARAMS_TEST, numberOfParts: BigInt(0) }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidNumParts',
      })
    })

    test('should invalidate zero frequency across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({ ...TWAP_PARAMS_TEST, timeBetweenParts: BigInt(0) }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidFrequency',
      })
    })

    test('should invalidate invalid span for limit duration across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({
          ...TWAP_PARAMS_TEST,
          durationOfPart: {
            durationType: DurationType.LIMIT_DURATION,
            duration: TWAP_PARAMS_TEST.timeBetweenParts + BigInt(1),
          },
        }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidSpan',
      })
    })

    test('should invalidate invalid data (ABI parse error) across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const result = Twap.fromData({ ...TWAP_PARAMS_TEST, appData: ZERO_ADDRESS }).isValid()
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        isValid: false,
        reason: 'InvalidData',
      })
    })
  })

  describe('Serialize', () => {
    test('should serialize correctly across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const serializedResults: string[] = []
      const FIXED_SALT = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData(TWAP_PARAMS_TEST, FIXED_SALT) // Use fixed salt
        const serialized = twap.serialize()
        serializedResults.push(serialized)
      }

      // All serialized results should be identical
      const [firstSerialized, ...remainingSerialized] = serializedResults
      remainingSerialized.forEach((serialized) => {
        expect(serialized).toEqual(firstSerialized)
      })

      expect(firstSerialized).toEqual(TWAP_SERIALIZED(FIXED_SALT))
    })
  })

  describe('Deserialize', () => {
    test('should deserialize correctly across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // First get a serialized TWAP from one adapter
      setGlobalAdapter(adapters[adapterNames[0]!])
      const originalTwap = Twap.fromData(TWAP_PARAMS_TEST)
      const serialized = TWAP_SERIALIZED(originalTwap.salt)

      const deserializedTwaps: Twap[] = []

      // Deserialize with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const deserialized = Twap.deserialize(serialized)
        deserializedTwaps.push(deserialized)
      }

      // All deserialized TWAPs should match the original
      deserializedTwaps.forEach((twap) => {
        expect(twap).toMatchObject(originalTwap)
      })
    })

    test('should deserialize order with t0 set to epoch across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const serializedOrder =
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000006cf1e9ca41f7611def408122793c358a3d11e5a541617665537761707065722d545741502d537761700000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001400000000000000000000000007fc66500c84a76ad7e9c93437bfc5ac33e2ddae9000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000003765a685a401622c060e5d700d9ad89413363a9100000000000000000000000000000000000000000000000009b6e64a8ec6000000000000000000000000000000000000000000000000000000000000055d4a800000000000000000000000000000000000000000000000000000000067f702df0000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000001518000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

      const deserializedTwaps: Twap[] = []

      // Deserialize with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.deserialize(serializedOrder)
        deserializedTwaps.push(twap)
      }

      // All deserialized TWAPs should have identical properties
      const [firstTwap, ...remainingTwaps] = deserializedTwaps
      remainingTwaps.forEach((twap) => {
        expect(twap.handler).toEqual(firstTwap.handler)
        expect(twap.salt).toEqual(firstTwap.salt)
        expect(twap.staticInput).toEqual(firstTwap.staticInput)
        expect(twap.data).toEqual(firstTwap.data)
        expect(twap.hasOffChainInput).toEqual(firstTwap.hasOffChainInput)
        expect(twap.isSingleOrder).toEqual(firstTwap.isSingleOrder)
      })

      // Verify expected values
      expect(firstTwap.handler).toEqual('0x6cF1e9cA41f7611dEf408122793c358a3d11E5a5')
      expect(firstTwap.salt).toEqual('0x41617665537761707065722d545741502d537761700000000000000000000000')
      expect(firstTwap.hasOffChainInput).toEqual(false)
      expect(firstTwap.isSingleOrder).toEqual(true)
    })

    test('should throw if invalid across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        expect(() => Twap.deserialize('0x')).toThrow('InvalidSerializedConditionalOrder')
      }
    })
  })

  describe('To String', () => {
    test('should format string correctly with default settings across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const stringResults: string[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData(TWAP_PARAMS_TEST, SALT)
        const str = twap.toString()
        stringResults.push(str)
      }

      // All string results should be identical
      const [firstString, ...remainingStrings] = stringResults
      remainingStrings.forEach((str) => {
        expect(str).toEqual(firstString)
      })

      expect(firstString).toEqual(
        'twap (0xd8a6889486a47d8ca8f4189f11573b39dbc04f605719ebf4050e44ae53c1bedf): {"sellAmount":"1000000000000000000","sellToken":"0x6810e776880C02933D47DB1b9fc05908e5386b96","buyAmount":"1000000000000000000","buyToken":"0xDAE5F1590db13E3B40423B5b5c5fbf175515910b","numberOfParts":"10","startTime":"AT_MINING_TIME","timeBetweenParts":3600,"durationOfPart":"AUTO","receiver":"0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF","appData":"0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5"}',
      )
    })

    test('should format string correctly with start time at epoch across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const stringResults: string[] = []

      const paramsWithEpoch = {
        ...TWAP_PARAMS_TEST,
        startTime: {
          startType: StartTimeValue.AT_EPOCH,
          epoch: BigInt(1692876646),
        },
      }

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData(paramsWithEpoch, SALT)
        const str = twap.toString()
        stringResults.push(str)
      }

      // All string results should be identical
      const [firstString, ...remainingStrings] = stringResults
      remainingStrings.forEach((str) => {
        expect(str).toEqual(firstString)
      })

      expect(firstString).toEqual(
        'twap (0x28b19554c54f10b67f6ef7e72bdc552fb865b12d33b797ac51227768705fff0d): {"sellAmount":"1000000000000000000","sellToken":"0x6810e776880C02933D47DB1b9fc05908e5386b96","buyAmount":"1000000000000000000","buyToken":"0xDAE5F1590db13E3B40423B5b5c5fbf175515910b","numberOfParts":"10","startTime":1692876646,"timeBetweenParts":3600,"durationOfPart":"AUTO","receiver":"0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF","appData":"0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5"}',
      )
    })

    test('should format string correctly with limit duration across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const stringResults: string[] = []

      const paramsWithLimitDuration = {
        ...TWAP_PARAMS_TEST,
        durationOfPart: {
          durationType: DurationType.LIMIT_DURATION,
          duration: BigInt(1000),
        },
      }

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData(paramsWithLimitDuration, SALT)
        const str = twap.toString()
        stringResults.push(str)
      }

      // All string results should be identical
      const [firstString, ...remainingStrings] = stringResults
      remainingStrings.forEach((str) => {
        expect(str).toEqual(firstString)
      })

      expect(firstString).toEqual(
        'twap (0x7352e87b6e5d7c4e27479a13b7ba8bc0d67a947d1692994bd995c9dcc94c166a): {"sellAmount":"1000000000000000000","sellToken":"0x6810e776880C02933D47DB1b9fc05908e5386b96","buyAmount":"1000000000000000000","buyToken":"0xDAE5F1590db13E3B40423B5b5c5fbf175515910b","numberOfParts":"10","startTime":"AT_MINING_TIME","timeBetweenParts":3600,"durationOfPart":1000,"receiver":"0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF","appData":"0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5"}',
      )
    })
  })

  describe('Poll Validate', () => {
    const blockNumber = 123456
    const blockTimestamp = 1700000000
    const mockCabinet: jest.MockedFunction<(params: OwnerContext) => Promise<string>> = jest.fn()
    const mockEndTimestamp: jest.MockedFunction<(startTimestamp: number) => number> = jest.fn()
    const mockGetBlock: jest.MockedFunction<(blockHashOrBlockTag: string | Promise<string>) => Promise<Block>> =
      jest.fn()

    const provider = {
      getBlock: mockGetBlock,
    } as unknown as Provider

    const pollParams = {
      owner: OWNER,
      chainId: 1,
      provider,
    } as PollParams

    class MockTwap extends Twap {
      public pollValidate(params: PollParams): Promise<PollResultErrors | undefined> {
        return super.pollValidate(params)
      }

      cabinet = mockCabinet
      endTimestamp = mockEndTimestamp
    }

    beforeEach(() => {
      jest.resetAllMocks()
    })

    test('should pass validation for open TWAP (t=0) across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new MockTwap({ handler: TWAP_ADDRESS, data: TWAP_PARAMS_TEST })

        // GIVEN: An active TWAP (creation was mined 1 second ago and should finish in 1 second)
        mockCabinet.mockReturnValue(uint256Helper(blockTimestamp - 1))
        mockEndTimestamp.mockReturnValue(blockTimestamp + 1)

        // WHEN: We poll
        const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })

        // THEN: Successful validation
        expect(result).toEqual(undefined)

        jest.resetAllMocks()
      }
    })

    test('should pass validation for open TWAP (t0 set to epoch) across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new MockTwap({
          handler: TWAP_ADDRESS,
          data: {
            ...TWAP_PARAMS_TEST,
            startTime: { startType: StartTimeValue.AT_EPOCH, epoch: BigInt(blockTimestamp - 1) },
          },
        })

        // GIVEN: A TWAP that is active (expires in 1 second)
        mockEndTimestamp.mockReturnValue(blockTimestamp + 1)
        mockCabinet.mockReturnValue(uint256Helper(0))

        // WHEN: We poll
        const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })

        // THEN: Successful validation
        expect(result).toEqual(undefined)

        jest.resetAllMocks()
      }
    })

    test('should return TRY_AT_EPOCH when TWAP has not started across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new MockTwap({ handler: TWAP_ADDRESS, data: TWAP_PARAMS_TEST })

        // GIVEN: A TWAP that hasn't started (should start in 1 second)
        const startTime = blockTimestamp + 1
        mockCabinet.mockReturnValue(uint256Helper(startTime))
        mockEndTimestamp.mockReturnValue(blockTimestamp + 2)

        // WHEN: We poll
        const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })
        results.push(result)

        jest.resetAllMocks()
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        result: PollResultCode.TRY_AT_EPOCH,
        epoch: blockTimestamp + 1,
        reason: `TWAP hasn't started yet. Starts at ${blockTimestamp + 1} (2023-11-14T22:13:21.000Z)`,
      })
    })

    test('should return DONT_TRY_AGAIN when TWAP has expired across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new MockTwap({ handler: TWAP_ADDRESS, data: TWAP_PARAMS_TEST })

        // GIVEN: A TWAP that has already expired
        const expireTime = blockTimestamp - 1
        mockCabinet.mockReturnValue(uint256Helper(blockTimestamp - 2))
        mockEndTimestamp.mockReturnValue(expireTime)

        // WHEN: We poll
        const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })
        results.push(result)

        jest.resetAllMocks()
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        result: PollResultCode.DONT_TRY_AGAIN,
        reason: `TWAP has expired. Expired at ${blockTimestamp - 1} (2023-11-14T22:13:19.000Z)`,
      })
    })

    test('should handle cabinet overflow across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new MockTwap({ handler: TWAP_ADDRESS, data: TWAP_PARAMS_TEST })

        // GIVEN: The cabinet stored value is greater than uint32
        mockCabinet.mockReturnValue(uint256Helper(2 ** 32))

        // WHEN: We poll
        const result = await twap.pollValidate({ ...pollParams, blockInfo: { blockNumber, blockTimestamp } })
        results.push(result)

        jest.resetAllMocks()
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        result: PollResultCode.DONT_TRY_AGAIN,
        reason: 'Cabinet epoch out of range: 4294967296',
      })
    })

    test('should fetch latest block when blockInfo is not provided across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new MockTwap({ handler: TWAP_ADDRESS, data: TWAP_PARAMS_TEST })

        // GIVEN: We don't provide the blockInfo
        const blockInfo = undefined

        // GIVEN: The current block is before the start time
        mockGetBlock.mockReturnValue(
          Promise.resolve({
            number: blockNumber,
            timestamp: blockTimestamp,
          } as Block),
        )
        const startTime = blockTimestamp + 1
        mockCabinet.mockReturnValue(uint256Helper(startTime))
        mockEndTimestamp.mockReturnValue(blockTimestamp + 2)

        // WHEN: We poll
        const result = await twap.pollValidate({ ...pollParams, blockInfo })

        // THEN: It uses the right block timestamp to validate
        expect(result).toEqual({
          result: PollResultCode.TRY_AT_EPOCH,
          epoch: startTime,
          reason: `TWAP hasn't started yet. Starts at ${startTime} (2023-11-14T22:13:21.000Z)`,
        })

        jest.resetAllMocks()
      }
    })
  })

  describe('Current TWAP part is in the Order Book', () => {
    const blockNumber = 123456
    const startTimestamp = 1700000000
    const timeBetweenParts = 100
    const orderId = '0x1'
    const order = {} as GPv2Order.DataStruct

    const getPollParams = ({ blockTimestamp }: { blockTimestamp: number }) =>
      ({
        owner: OWNER,
        chainId: 1,
        provider: {},
        blockInfo: {
          blockNumber,
          blockTimestamp,
        },
      }) as PollParams

    class MockTwap extends Twap {
      public handlePollFailedAlreadyPresent(
        orderId: string,
        order: GPv2Order.DataStruct,
        params: PollParams,
      ): Promise<PollResultErrors | undefined> {
        return super.handlePollFailedAlreadyPresent(orderId, order, params)
      }
    }

    beforeEach(() => {
      jest.resetAllMocks()
    })

    test('should handle polling at start of part 1/10 across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      const pollParams = getPollParams({
        blockTimestamp: startTimestamp,
      })

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new MockTwap({
          handler: TWAP_ADDRESS,
          data: {
            ...TWAP_PARAMS_TEST,
            timeBetweenParts: BigInt(100),
            numberOfParts: BigInt(10),
            startTime: {
              startType: StartTimeValue.AT_EPOCH,
              epoch: BigInt(startTimestamp),
            },
          },
        })

        const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        result: PollResultCode.TRY_AT_EPOCH,
        reason:
          "Current active TWAP part (1/10) is already in the Order Book. TWAP part 2 doesn't start until 1700000100 (2023-11-14T22:15:00.000Z)",
        epoch: 1700000100,
      })
    })

    test('should handle polling at first second of part 10/10 across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      const pollParams = getPollParams({
        blockTimestamp: startTimestamp + 9 * timeBetweenParts,
      })

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new MockTwap({
          handler: TWAP_ADDRESS,
          data: {
            ...TWAP_PARAMS_TEST,
            timeBetweenParts: BigInt(100),
            numberOfParts: BigInt(10),
            startTime: {
              startType: StartTimeValue.AT_EPOCH,
              epoch: BigInt(startTimestamp),
            },
          },
        })

        const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        result: PollResultCode.DONT_TRY_AGAIN,
        reason:
          'Current active TWAP part (10/10) is already in the Order Book. This was the last TWAP part, no more orders need to be placed',
      })
    })

    test('should handle unexpected error when TWAP has not started across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const results: any[] = []

      const pollParams = getPollParams({
        blockTimestamp: startTimestamp - 1,
      })

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = new MockTwap({
          handler: TWAP_ADDRESS,
          data: {
            ...TWAP_PARAMS_TEST,
            timeBetweenParts: BigInt(100),
            numberOfParts: BigInt(10),
            startTime: {
              startType: StartTimeValue.AT_EPOCH,
              epoch: BigInt(startTimestamp),
            },
          },
        })

        const result = await twap.handlePollFailedAlreadyPresent(orderId, order, pollParams)
        results.push(result)
      }

      // All results should be identical
      const [firstResult, ...remainingResults] = results
      remainingResults.forEach((result) => {
        expect(result).toEqual(firstResult)
      })

      expect(firstResult).toEqual({
        result: PollResultCode.UNEXPECTED_ERROR,
        reason: "TWAP part hash't started. First TWAP part start at 1700000000 (2023-11-14T22:13:20.000Z)",
        error: undefined,
      })
    })
  })
})

// Helper function for uint256 encoding
const uint256Helper = (n: number) =>
  Promise.resolve(getGlobalAdapter().utils.encodeAbi([{ type: 'uint256' }], [n]) as string)

export function generateRandomTWAPData(): TwapData {
  const adapter = getGlobalAdapter()

  const sellToken = adapter.utils.getChecksumAddress(adapter.utils.randomBytes(20))
  const buyToken = adapter.utils.getChecksumAddress(adapter.utils.randomBytes(20))
  return {
    sellToken,
    buyToken,
    receiver: ZERO_ADDRESS,
    sellAmount: BigInt('1000000000000000000'), // 1 ETH
    buyAmount: BigInt('1000000000000000000'), // 1 ETH
    timeBetweenParts: BigInt(60 * 60),
    numberOfParts: BigInt(10),
    durationOfPart: {
      durationType: DurationType.AUTO,
    },
    startTime: {
      startType: StartTimeValue.AT_MINING_TIME,
    },
    appData: adapter.utils.randomBytes(32),
  }
}
