import { TWAP } from './types/twap'
import { TWAP_PARAMS_TEST, generateRandomTWAPData } from './types/twap.spec'
import { Multiplexer, Orders, ProofLocation } from './multiplexer'
import { SupportedChainId } from '../common'
import { ComposableCoW__factory } from './generated'

describe('Multiplexer (ComposableCoW)', () => {
  beforeEach(() => {
    // Register the TWAP handler
    Multiplexer.registerOrderType('TWAP', TWAP)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('constructor: can create a new multiplexer', () => {
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
    expect(m).toBeDefined()
  })

  test('constructor: orders cannot have non-zero length', () => {
    expect(() => {
      new Multiplexer(SupportedChainId.GNOSIS_CHAIN, {} as Orders)
    }).toThrow('orders must have non-zero length')
  })

  test('constructor: cannot have undefined root for orders', () => {
    expect(() => {
      const twap = TWAP.default(generateRandomTWAPData())

      new Multiplexer(SupportedChainId.GNOSIS_CHAIN, { [twap.id]: twap })
    }).toThrow('orders cannot have undefined root')
  })

  test('constructor: order types must be registered', () => {
    Multiplexer.resetOrderTypeRegistry()

    const twap = TWAP.default(generateRandomTWAPData())
    expect(() => {
      new Multiplexer(SupportedChainId.GNOSIS_CHAIN, { [twap.id]: twap }, '0x1234')
    }).toThrow(`Unknown order type: ${twap.orderType}`)
  })

  test('constructor: orders must have valid root supplied', () => {
    expect(() => {
      const twap = TWAP.default(generateRandomTWAPData())

      new Multiplexer(SupportedChainId.GNOSIS_CHAIN, { [twap.id]: twap }, '0x1234')
    }).toThrow('root mismatch')
  })

  test('crud: can add, remove, update, and get orders', () => {
    // Create a new multiplexer, add a TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
    const twap = TWAP.default(generateRandomTWAPData())
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
    const twap2 = TWAP.default(generateRandomTWAPData())
    m.add(twap2)

    // Confirm that the multiplexer has two orders
    expect(m.orderIds.length).toEqual(2)

    // Out of curiosity, get the root
    const root = m.root

    // Remove the first order
    m.remove(twap.id)

    // Confirm that the multiplexer has one order
    expect(m.orderIds.length).toEqual(1)

    // Update the second order, in that we'll just replace it with the first order
    m.update(twap2.id, (_o) => twap)

    // Confirm that the multiplexer has one order
    expect(m.orderIds.length).toEqual(1)

    // Confirm that the root has changed
    expect(m.root).not.toEqual(root)

    // Get the order by id
    const order3 = m.getById(twap.id)
    expect(order3).toBeDefined()
    expect(order3).toEqual(twap)
  })

  test('serde(toJSON): can serialize to JSON', () => {
    // Create a new multiplexer, add a TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
    const twap = TWAP.default(generateRandomTWAPData())
    m.add(twap)

    // Serialize the multiplexer
    const serialized = m.toJSON()
    expect(serialized).toBeDefined()

    // Try to serialize again (check for side-effects)
    const serialized2 = m.toJSON()
    expect(serialized2).toBeDefined()
    expect(serialized2).toEqual(serialized)
  })

  test('serde(fromJSON): enforce order types are registered', () => {
    // Create a new multiplexer, add a TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
    const twap = TWAP.default(generateRandomTWAPData())
    m.add(twap)

    // Serialize the multiplexer
    const serialized = m.toJSON()

    // Reset the registered order types
    Multiplexer.resetOrderTypeRegistry()

    // Try to deserialize the multiplexer
    expect(() => {
      Multiplexer.fromJSON(serialized)
    }).toThrow('Unknown order type: TWAP')
  })

  test('serde(toJSON/fromJSON): can serialize and deserialize', () => {
    // Create a new multiplexer, add a TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)

    // generate `n` random TWAP orders
    for (let i = 0; i < 10; i++) {
      m.add(TWAP.default(generateRandomTWAPData()))
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
  })

  test('serde(dumpProofs/decodeFromJSON): can serialize and deserialize', () => {
    // Create a new multiplexer, add a TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)

    // generate `n` random TWAP orders
    for (let i = 0; i < 10; i++) {
      m.add(TWAP.default(generateRandomTWAPData()))
    }

    // Generate a random index to get an order from the multiplexer
    const index = Math.floor(Math.random() * 10)

    // Get an order from the multiplexer
    const orderBefore = m.getByIndex(index)
    // get the leaf
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
  })

  test('prepareProofStruct: can prepare a proof struct', async () => {
    // Create a new multiplexer, add a TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)

    // generate `n` random TWAP orders
    for (let i = 0; i < 10; i++) {
      m.add(TWAP.default(generateRandomTWAPData()))
    }

    const proofStruct = await m.prepareProofStruct()

    // use the typechain generated interface to see if the proof struct is valid
    // by generating calldata for `setRoot`.

    ComposableCoW__factory.createInterface().encodeFunctionData('setRoot', [m.root, proofStruct])
  })

  test('prepareProofStruct: emits when location set to emitted', async () => {
    // Create a new multiplexer, add the standard TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
    const twap = TWAP.default(TWAP_PARAMS_TEST)
    m.add(twap)

    const proofStruct = await m.prepareProofStruct(ProofLocation.EMITTED)

    // use the typechain generated interface to see if the proof struct is valid
    // by generating calldata for `setRoot`.

    ComposableCoW__factory.createInterface().encodeFunctionData('setRoot', [m.root, proofStruct])
  })

  test('prepareProofStruct: throws on invalid location', async () => {
    // Create a new multiplexer, add the standard TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
    const twap = TWAP.default(TWAP_PARAMS_TEST)
    m.add(twap)

    await expect(m.prepareProofStruct(ProofLocation.EMITTED + 100)).rejects.toThrow('Unsupported location')
  })

  test('prepareProofStruct: uploader', async () => {
    // Create a new multiplexer, add the standard TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
    const twap = TWAP.default(TWAP_PARAMS_TEST)
    m.add(twap)

    try {
      await m.prepareProofStruct(ProofLocation.SWARM)
    } catch (e) {
      expect(e.message).toMatch('Error preparing proof struct: Error: Must provide an uploader function')
    }

    // define an async upload function
    const upload = async (_data: string): Promise<string> => {
      return 'baddata'
    }

    try {
      await m.prepareProofStruct(ProofLocation.SWARM, undefined, upload)
    } catch (e) {
      expect(e.message).toMatch('Error preparing proof struct: Error: data returned by uploader is invalid')
    }

    // define an upload function that throws an error
    const upload2 = async (_data: string): Promise<string> => {
      throw new Error('bad')
    }

    try {
      await m.prepareProofStruct(ProofLocation.IPFS, undefined, upload2)
    } catch (e) {
      expect(e.message).toMatch(
        'Error preparing proof struct: Error: Error uploading to decentralized storage 5: Error: bad'
      )
    }
  })
})
