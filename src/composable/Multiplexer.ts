import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { BigNumber, providers, utils } from 'ethers'

import { SupportedChainId } from '../common'

import { ComposableCoW, GPv2Order } from '../common/generated/ComposableCoW'
import { ProofLocation, ProofWithParams, ConditionalOrderParams } from './types'
import { ConditionalOrder } from './ConditionalOrder'
import { getComposableCow } from './contracts'

const CONDITIONAL_ORDER_LEAF_ABI = ['address', 'bytes32', 'bytes']

const PAYLOAD_EMITTED_ABI = ['tuple(bytes32[] proof, tuple(address handler, bytes32 salt, bytes staticInput) params)[]']

export type Orders = Record<string, ConditionalOrder<unknown, unknown>>

/**
 * Multiplexer for conditional orders - using `ComposableCoW`!
 *
 * This class provides functionality to:
 * - Generate a merkle tree of conditional orders
 * - Generate proofs for all orders in the merkle tree
 * - Save proofs, with the ability to omit / skip specific conditional orders
 * - Support for passing an optional upload function to upload the proofs to a decentralized storage network
 */
export class Multiplexer {
  static orderTypeRegistry: Record<string, new (...args: unknown[]) => ConditionalOrder<unknown, unknown>> = {}

  public chain: SupportedChainId
  public location: ProofLocation

  private orders: Orders = {}
  private tree?: StandardMerkleTree<string[]>
  private ctx?: string

  /**
   * @param chain The `chainId` for where we're using `ComposableCoW`.
   * @param orders An optional array of conditional orders to initialize the merkle tree with.
   * @param root An optional root to verify against.
   * @param location The location of the proofs for the conditional orders.
   */
  constructor(
    chain: SupportedChainId,
    orders?: Orders,
    root?: string,
    location: ProofLocation = ProofLocation.PRIVATE
  ) {
    this.chain = chain
    this.location = location

    // If orders are provided, the length must be > 0
    if (orders && Object.keys(orders).length === 0) {
      throw new Error('orders must have non-zero length')
    }

    // If orders are provided, so must a root, and vice versa
    if ((orders && !root) || (!orders && root)) {
      throw new Error('orders cannot have undefined root')
    }

    // can only proceed past here if both orders and root are provided, or neither are

    // validate that no unknown order types are provided
    for (const orderKey in orders) {
      if (orders.hasOwnProperty(orderKey)) {
        const order = orders[orderKey]
        if (!Multiplexer.orderTypeRegistry.hasOwnProperty(order.orderType)) {
          throw new Error(`Unknown order type: ${order.orderType}`)
        }
      }
    }

    // If orders (and therefore the root) are provided, generate the merkle tree
    if (orders) {
      this.orders = orders

      // if generate was successful, we can verify the root
      if (this.getOrGenerateTree().root !== root) {
        throw new Error('root mismatch')
      }
    }
  }

  // --- user facing serialization methods ---

  /**
   * Given a serialized multiplexer, create the multiplexer and rehydrate all conditional orders.
   * Integrity of the multiplexer will be verified by generating the merkle tree and verifying
   * the root.
   *
   * **NOTE**: Before using this method, you must register all conditional order types using `Multiplexer.registerOrderType`.
   * @param s The serialized multiplexer.
   * @returns The multiplexer with all conditional orders rehydrated.
   * @throws If the multiplexer cannot be deserialized.
   * @throws If the merkle tree cannot be generated.
   * @throws If the merkle tree cannot be verified against the root.
   */
  static fromJSON(s: string): Multiplexer {
    // reviver function to deserialize the orders
    const reviver = (k: string, v: any) => {
      if (k === 'orders' && typeof v === 'object' && v !== null) {
        const orders: Orders = {}

        for (const orderKey in v) {
          if (v.hasOwnProperty(orderKey)) {
            const { orderType, ...orderData } = v[orderKey]

            if (Multiplexer.orderTypeRegistry.hasOwnProperty(orderType)) {
              const OrderConstructor = Multiplexer.orderTypeRegistry[orderType]
              orders[orderKey] = new OrderConstructor(orderData)
            } else {
              throw new Error(`Unknown order type: ${orderType}`)
            }
          }
        }

        return orders
      }

      // Make sure we deserialize `BigNumber` correctly
      if (typeof v === 'object' && v !== null && v.hasOwnProperty('type') && v.hasOwnProperty('hex')) {
        if (v.type === 'BigNumber') {
          return BigNumber.from(v)
        }
      }

      return v
    }

    const { chain, orders, root, location } = JSON.parse(s, reviver)
    const m = new Multiplexer(chain, orders, root)
    m.location = location
    return m
  }

  /**
   * Serialize the multiplexer to JSON.
   *
   * This will include all state necessary to reconstruct the multiplexer, including the root.
   * @remarks This will **NOT** include the merkle tree.
   * @returns The JSON representation of the multiplexer, including the root but excluding the merkle tree.
   */
  toJSON(): string {
    const root = this.getOrGenerateTree().root

    // serialize the multiplexer, including the root but excluding the merkle tree.
    return JSON.stringify({ ...this, root }, (k, v) => {
      // filter out the merkle tree
      if (k === 'tree') return undefined
      if (typeof v === 'object' && v !== null && 'orderType' in v) {
        const conditionalOrder = v as ConditionalOrder<unknown, unknown>
        return {
          ...conditionalOrder,
          orderType: conditionalOrder.orderType,
        }
      }
      // We do not do any custom serialization of `BigNumber` in order to preserve it's type.
      return v
    })
  }

  // --- crud methods ---

  /**
   * Add a conditional order to the merkle tree.
   * @param order The order to add to the merkle tree.
   */
  add<T, P>(order: ConditionalOrder<T, P>): void {
    order.assertIsValid()

    this.orders[order.id] = order
    this.reset()
  }

  /**
   * Remove a conditional order from the merkle tree.
   * @param id The id of the `ConditionalOrder` to remove from the merkle tree.
   */
  remove(id: string): void {
    delete this.orders[id]
    this.reset()
  }

  /**
   * Update a given conditional order in the merkle tree.
   * @param id The id of the `ConditionalOrder` to update.
   * @param updater A function that takes the existing `ConditionalOrder` and context, returning an updated `ConditionalOrder`.
   */
  update(
    id: string,
    updater: (order: ConditionalOrder<unknown, unknown>, ctx?: string) => ConditionalOrder<unknown, unknown>
  ): void {
    // copy the existing order and update it, given the existing context (if any)
    const order = updater(this.orders[id], this.ctx)
    // delete the existing order
    delete this.orders[id]

    // add the updated order
    this.orders[order.id] = order
    this.reset()
  }

  // --- accessors ---

  /**
   * Accessor for a given conditional order in the multiplexer.
   * @param id The `id` of the `ConditionalOrder` to retrieve.
   * @returns A `ConditionalOrder` with the given `id`.
   */
  getById(id: string): ConditionalOrder<unknown, unknown> {
    return this.orders[id]
  }

  /**
   * Accessor for a given conditional order in the multiplexer.
   * @param i The index of the `ConditionalOrder` to retrieve.
   * @returns A `ConditionalOrder` at the given index.
   */
  getByIndex(i: number): ConditionalOrder<unknown, unknown> {
    return this.orders[this.orderIds[i]]
  }

  /**
   * Get all the conditional order ids in the multiplexer.
   */
  get orderIds(): string[] {
    return Object.keys(this.orders)
  }

  get root(): string {
    return this.getOrGenerateTree().root
  }

  /**
   * Retrieve the merkle tree of orders, or generate it if it doesn't exist.
   *
   * **CAUTION**: Developers of the SDK should prefer to use this method instead of generating the
   *              merkle tree themselves. This method makes use of caching to avoid generating the
   *              merkle tree needlessly.
   * @throws If the merkle tree cannot be generated.
   * @returns The merkle tree for the current set of conditional orders.
   */
  private getOrGenerateTree(): StandardMerkleTree<string[]> {
    if (!this.tree) {
      this.tree = StandardMerkleTree.of(
        Object.values(this.orders).map((order) => [...Object.values(order.leaf)]),
        CONDITIONAL_ORDER_LEAF_ABI
      )
    }

    return this.tree
  }

  // --- serialization for watchtowers / indexers ---

  /**
   * The primary method for watch towers to use when deserializing the proofs and parameters for the conditional orders.
   * @param s The serialized proofs with parameters for consumption by watchtowers / indexers.
   * @returns The `ProofWithParams` array.
   * @throws If the `ProofWithParams` array cannot be deserialized.
   */
  static decodeFromJSON(s: string): ProofWithParams[] {
    // no need to rehydrate `BigNumber` as this is fully ABI encoded
    return JSON.parse(s)
  }

  /**
   * The primary entry point for dapps integrating with `ComposableCoW` to generate the proofs and
   * parameters for the conditional orders.
   *
   * After populating the multiplexer with conditional orders, this method can be used to generate
   * the proofs and parameters for the conditional orders. The returned `ProofStruct` can then be
   * used with `setRoot` or `setRootWithContext` on a `ComposableCoW`-enabled Safe.
   *
   * @param filter {@link getProofs}
   * @parma locFn A function that takes the off-chain encoded input, and returns the `location`
   *        for the `ProofStruct`, and the `data` for the `ProofStruct`.
   * @returns The ABI-encoded `ProofStruct` for `setRoot` and `setRootWithContext`.
   */
  async prepareProofStruct(
    location: ProofLocation = this.location,
    filter?: (v: string[]) => boolean,
    uploader?: (offChainEncoded: string) => Promise<string>
  ): Promise<ComposableCoW.ProofStruct> {
    const data = async (): Promise<string> => {
      switch (location) {
        case ProofLocation.PRIVATE:
          return '0x'
        case ProofLocation.EMITTED:
          return this.encodeToABI(filter)
        case ProofLocation.SWARM:
        case ProofLocation.WAKU:
        case ProofLocation.IPFS:
          if (!uploader) throw new Error('Must provide an uploader function')
          try {
            return await uploader(this.encodeToJSON(filter))
          } catch (e) {
            throw new Error(`Error uploading to decentralized storage ${location}: ${e}`)
          }
        default:
          throw new Error('Unsupported location')
      }
    }

    return await data()
      .then((d) => {
        try {
          // validate that `d` is a valid `bytes` ready to be abi-encoded
          utils.hexlify(utils.arrayify(d))

          // if we get here, we have a valid `data` field for the `ProofStruct`
          // This means that if there was an upload function, it was called and the upload was successful
          // note: we don't check if the location has changed because we don't care
          this.location = location

          return {
            location,
            data: d,
          }
        } catch (e) {
          throw new Error(`data returned by uploader is invalid`)
        }
      })
      .catch((e) => {
        throw new Error(`Error preparing proof struct: ${e}`)
      })
  }

  /**
   * Poll a conditional order to see if it is tradeable.
   * @param owner The owner of the conditional order.
   * @param p The proof and parameters.
   * @param chain Which chain to use for the ComposableCoW contract.
   * @param provider An RPC provider for the chain.
   * @param offChainInputFn A function, if provided, that will return the off-chain input for the conditional order.
   * @throws If the conditional order is not tradeable.
   * @returns The tradeable `GPv2Order.Data` struct and the `signature` for the conditional order.
   */
  static async poll(
    owner: string,
    p: ProofWithParams,
    chain: SupportedChainId,
    provider: providers.Provider,
    offChainInputFn?: (owner: string, params: ConditionalOrderParams) => Promise<string>
  ): Promise<[GPv2Order.DataStruct, string]> {
    const composableCow = getComposableCow(chain, provider)

    const offChainInput = offChainInputFn ? await offChainInputFn(owner, p.params) : '0x'
    return await composableCow.getTradeableOrderWithSignature(owner, p.params, offChainInput, p.proof)
  }

  /**
   * The primary entry point for dumping the proofs and parameters for the conditional orders.
   *
   * This is to be used by watchtowers / indexers to store the proofs and parameters for the
   * conditional orders off-chain. The encoding returned by this method may **NOT** contain all
   * proofs and parameters, depending on the `filter` provided, and therefore should not be used
   * to rehydrate the multiplexer from a user's perspective.
   * @param filter {@link getProofs}
   * @returns A JSON-encoded string of the proofs and parameters for the conditional orders.
   */
  dumpProofs(filter?: (v: string[]) => boolean): string {
    return this.encodeToJSON(filter)
  }

  dumpProofsAndParams(filter?: (v: string[]) => boolean): ProofWithParams[] {
    return this.getProofs(filter)
  }

  /**
   * Get the proofs with parameters for the conditional orders in the merkle tree.
   * @param filter A function that takes a conditional order and returns a boolean indicating
   *               whether the order should be included in the proof.
   * @returns An array of proofs and their order's parameters for the conditional orders in the
   *          merkle tree.
   */
  private getProofs(filter?: (v: string[]) => boolean): ProofWithParams[] {
    // Get a list of all entry indices in the tree, excluding any that don't match the filter
    return [...this.getOrGenerateTree().entries()]
      .map(([i, v]) => {
        if ((filter && filter(v)) || filter === undefined) {
          return { idx: i, value: v }
        } else {
          return undefined
        }
      })
      .reduce((acc: ProofWithParams[], x) => {
        if (x) {
          const p: ConditionalOrderParams = {
            handler: x.value[0],
            salt: x.value[1],
            staticInput: x.value[2],
          }
          acc.push({
            proof: this.getOrGenerateTree().getProof(x.idx),
            params: p,
          })
        }
        return acc
      }, [])
  }

  /**
   * ABI-encode the proofs and parameters for the conditional orders in the merkle tree.
   * @param filter {@link getProofs}
   * @returns ABI-encoded `data` for the `ProofStruct`.
   */
  private encodeToABI(filter?: (v: string[]) => boolean): string {
    return utils.defaultAbiCoder.encode(PAYLOAD_EMITTED_ABI, [this.getProofs(filter)])
  }

  /**
   * JSON-encode the proofs and parameters for the conditional orders in the merkle tree.
   * @param filter {@link getProofs}
   * @returns The JSON-encoded data for storage off-chain.
   */
  private encodeToJSON(filter?: (v: string[]) => boolean): string {
    return JSON.stringify(this.getProofs(filter))
  }

  /**
   * A helper to reset the merkle tree.
   */
  private reset(): void {
    this.tree = undefined
  }

  /**
   * Register a conditional order type with the multiplexer.
   *
   * **CAUTION**: This is required for using `Multiplexer.fromJSON` and `Multiplexer.toJSON`.
   * @param orderType The order type to register.
   * @param conditionalOrderClass The class to use for the given order type.
   */
  public static registerOrderType(
    orderType: string,
    conditionalOrderClass: new (...args: any[]) => ConditionalOrder<unknown, unknown>
  ) {
    Multiplexer.orderTypeRegistry[orderType] = conditionalOrderClass
  }

  /**
   * Reset the order type registry.
   */
  public static resetOrderTypeRegistry() {
    Multiplexer.orderTypeRegistry = {}
  }
}
