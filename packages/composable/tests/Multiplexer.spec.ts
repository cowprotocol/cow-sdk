import { Multiplexer, Orders } from '../src/Multiplexer'
import { ProofLocation } from '../src/types'
import { Twap } from '../src/orderTypes/Twap'
import { TWAP_PARAMS_TEST } from './Twap.spec'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { getGlobalAdapter, setGlobalAdapter, ZERO_ADDRESS } from '@cowprotocol/sdk-common'
import { ComposableCowFactoryAbi } from '../src/abis/ComposableCowFactoryAbi'
import { createAdapters } from './setup'
import { DurationType, StartTimeValue, TwapData } from '../src/orderTypes/Twap'

describe('Multiplexer (ComposableCoW) - Multi-Adapter Tests', () => {
  let adapters: ReturnType<typeof createAdapters>

  function generateRandomTWAPData(adapterName: keyof typeof adapters): TwapData {
    setGlobalAdapter(adapters[adapterName])
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

  beforeAll(() => {
    adapters = createAdapters()
  })

  beforeEach(() => {
    // Register the TWAP handler
    Multiplexer.registerOrderType('twap', Twap)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Constructor', () => {
    test('should create new multiplexer across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const multiplexers: Multiplexer[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
        multiplexers.push(m)
      }

      // All multiplexers should be defined
      multiplexers.forEach((m) => {
        expect(m).toBeDefined()
      })
    })

    test('should throw for orders with zero length across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        expect(() => {
          new Multiplexer(SupportedChainId.GNOSIS_CHAIN, {} as Orders)
        }).toThrow('orders must have non-zero length')
      }
    })

    test('should throw for undefined root when orders provided across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData(generateRandomTWAPData(adapterName))

        expect(() => {
          new Multiplexer(SupportedChainId.GNOSIS_CHAIN, { [twap.id]: twap })
        }).toThrow('orders cannot have undefined root')
      }
    })

    test('should throw for unregistered order types across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        Multiplexer.resetOrderTypeRegistry()

        const twap = Twap.fromData(generateRandomTWAPData(adapterName))
        expect(() => {
          new Multiplexer(SupportedChainId.GNOSIS_CHAIN, { [twap.id]: twap }, '0x1234')
        }).toThrow(`Unknown order type: ${twap.orderType}`)

        // Re-register for next iteration
        Multiplexer.registerOrderType('twap', Twap)
      }
    })

    test('should throw for invalid root across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const twap = Twap.fromData(generateRandomTWAPData(adapterName))

        expect(() => {
          new Multiplexer(SupportedChainId.GNOSIS_CHAIN, { [twap.id]: twap }, '0x1234')
        }).toThrow('root mismatch')
      }
    })
  })

  describe('CRUD Operations', () => {
    test('should add, remove, update, and get orders consistently across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        // Create a new multiplexer, add a TWAP order
        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
        const twap = Twap.fromData(generateRandomTWAPData(adapterName))
        m.add(twap)

        // Get the order by id
        const order = m.getById(twap.id)
        expect(order).toBeDefined()
        expect(order).toEqual(twap)

        // Get the order by index
        const order2 = m.getByIndex(0)
        expect(order2).toBeDefined()
        expect(order2).toEqual(twap)

        // Create another random TWAP order
        const twap2 = Twap.fromData(generateRandomTWAPData(adapterName))
        m.add(twap2)

        // Confirm that the multiplexer has two orders
        expect(m.orderIds.length).toEqual(2)

        // Get the root
        const root = m.root

        // Remove the first order
        m.remove(twap.id)

        // Confirm that the multiplexer has one order
        expect(m.orderIds.length).toEqual(1)

        // Update the second order, replacing it with the first order
        m.update(twap2.id, (_o) => twap)

        // Confirm that the multiplexer has one order
        expect(m.orderIds.length).toEqual(1)

        // Confirm that the root has changed
        expect(m.root).not.toEqual(root)

        // Get the order by id
        const order3 = m.getById(twap.id)
        expect(order3).toBeDefined()
        expect(order3).toEqual(twap)
      }
    })

    test('should reject invalid conditional orders across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
        const invalidTwap = Twap.fromData({
          ...generateRandomTWAPData(adapterName),
          timeBetweenParts: BigInt(-1),
        })

        expect(() => m.add(invalidTwap)).toThrow('Invalid order: InvalidFrequency')
      }
    })
  })

  describe('Serialization - toJSON', () => {
    test('should serialize to JSON consistently across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const serializedResults: string[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
        const twap = Twap.fromData(generateRandomTWAPData(adapterName))
        m.add(twap)

        // Serialize the multiplexer
        const serialized = m.toJSON()
        expect(serialized).toBeDefined()

        // Serialize again to check for side effects
        const serialized2 = m.toJSON()
        expect(serialized2).toBeDefined()
        expect(serialized2).toEqual(serialized)

        serializedResults.push(serialized)
      }

      // All serializations should be valid JSON
      serializedResults.forEach((serialized) => {
        expect(() => JSON.parse(serialized)).not.toThrow()
      })
    })
  })

  describe('Serialization - fromJSON', () => {
    test('should enforce order types are registered across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
        const twap = Twap.fromData(generateRandomTWAPData(adapterName))
        m.add(twap)

        // Serialize the multiplexer
        const serialized = m.toJSON()

        // Reset the registered order types
        Multiplexer.resetOrderTypeRegistry()

        // Try to deserialize the multiplexer
        expect(() => {
          Multiplexer.fromJSON(serialized)
        }).toThrow('Unknown order type: twap')

        // Re-register for next iteration
        Multiplexer.registerOrderType('twap', Twap)
      }
    })

    test('should serialize and deserialize correctly across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)

        // Generate 10 random TWAP orders
        const orders: Twap[] = []
        for (let i = 0; i < 10; i++) {
          const twap = Twap.fromData(generateRandomTWAPData(adapterName))
          m.add(twap)
          orders.push(twap)
        }

        // Generate a random index to get an order from the multiplexer
        const index = Math.floor(Math.random() * 10)

        // Get an order from the multiplexer
        const orderBefore = m.getByIndex(index)
        const orderId = orderBefore.id

        // Serialize the multiplexer
        const serialized = m.toJSON()

        // Deserialize the multiplexer
        const m2 = Multiplexer.fromJSON(serialized)

        // Get an order from the deserialized multiplexer
        const orderAfter = m2.getById(orderId)

        // Compare the two orders
        expect(orderBefore).toEqual(orderAfter)
      }
    })
  })

  describe('Proof Operations', () => {
    test('should dump proofs and decode from JSON consistently across all adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)

        // Generate 10 random TWAP orders
        for (let i = 0; i < 10; i++) {
          m.add(Twap.fromData(generateRandomTWAPData(adapterName)))
        }

        // Generate a random index to get an order from the multiplexer
        const index = Math.floor(Math.random() * 10)

        // Get an order from the multiplexer
        const orderBefore = m.getByIndex(index)
        // Get the leaf
        const leaf = orderBefore.leaf

        const filter = (v: string[]) => {
          const { handler, salt, staticInput } = leaf
          return !(handler === v[0] && salt === v[1] && staticInput === v[2])
        }

        // Dump the proofs
        const serialized = m.dumpProofs(filter)
        const unserialized = m.dumpProofsAndParams(filter)

        // Deserialize the proofs
        const artifact = Multiplexer.decodeFromJSON(serialized)

        expect(artifact).toEqual(unserialized)

        // The artifact should not contain the leaf
        artifact.forEach((v) => {
          expect(v.params).not.toEqual(leaf)
        })
      }
    })

    test('should prepare proof struct correctly across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)

        // Generate 10 random TWAP orders
        for (let i = 0; i < 10; i++) {
          m.add(Twap.fromData(generateRandomTWAPData(adapterName)))
        }

        const proofStruct = await m.prepareProofStruct()

        // Use the ABI to generate calldata for `setRoot` to verify the proof struct is valid
        expect(() => {
          getGlobalAdapter().utils.encodeFunction(ComposableCowFactoryAbi, 'setRoot', [m.root, proofStruct])
        }).not.toThrow()
      }
    })

    test('should emit when location set to emitted across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
        const twap = Twap.fromData(TWAP_PARAMS_TEST)
        m.add(twap)

        const proofStruct = await m.prepareProofStruct(ProofLocation.EMITTED)

        // Use the ABI to generate calldata for `setRoot` to verify the proof struct is valid
        expect(() => {
          getGlobalAdapter().utils.encodeFunction(ComposableCowFactoryAbi, 'setRoot', [m.root, proofStruct])
        }).not.toThrow()
      }
    })

    test('should throw on invalid location across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
        const twap = Twap.fromData(TWAP_PARAMS_TEST)
        m.add(twap)

        await expect(m.prepareProofStruct(ProofLocation.EMITTED + 100)).rejects.toThrow('Unsupported location')
      }
    })

    test('should handle uploader functions correctly across all adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])

        const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
        const twap = Twap.fromData(TWAP_PARAMS_TEST)
        m.add(twap)

        // Test missing uploader function
        try {
          await m.prepareProofStruct(ProofLocation.SWARM)
        } catch (e) {
          expect((e as Error).message).toMatch('Error preparing proof struct: Error: Must provide an uploader function')
        }

        // Test uploader returning invalid data
        const upload = async (_data: string): Promise<string> => {
          return 'baddata'
        }

        try {
          await m.prepareProofStruct(ProofLocation.SWARM, undefined, upload)
        } catch (e) {
          expect((e as Error).message).toMatch(
            'Error preparing proof struct: Error: data returned by uploader is invalid',
          )
        }

        // Test uploader throwing error
        const upload2 = async (_data: string): Promise<string> => {
          throw new Error('bad')
        }

        try {
          await m.prepareProofStruct(ProofLocation.IPFS, undefined, upload2)
        } catch (e) {
          expect((e as Error).message).toMatch(
            'Error preparing proof struct: Error: Error uploading to decentralized storage 5: Error: bad',
          )
        }
      }
    })
  })
})
