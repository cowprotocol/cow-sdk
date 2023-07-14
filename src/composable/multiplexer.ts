import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { utils } from 'ethers'

import { SupportedChainId } from '../common'
import { BaseConditionalOrder, ConditionalOrderParams } from './conditionalorder'

const CONDITIONAL_ORDER_LEAF_ABI = ['address', 'bytes32', 'bytes']

// const PAYLOAD_ABI = [
//   'tuple(bytes32[] proof, tuple(address handler, bytes32 salt, bytes staticInput) params, bytes offchainInput)',
// ]

const PAYLOAD_EMITTED_ABI = ['tuple(bytes32[] proof, tuple(address handler, bytes32 salt, bytes staticInput) params)[]']

// const PROOF_ABI = ['tuple(uint256 location, bytes data)']

export enum ProofLocation {
  // The location of the proofs is private to the caller.
  PRIVATE = 0,
  // The `data` field of the emitted `Proof` struct contains proofs + conditional order parameters.
  EMITTED = 1,
  // The `data` field of the emitted `Proof` struct contains the Swarm address (`bytes32`) of the proofs + conditional order parameters.
  SWARM = 2,
  // The `data` field is set to TBD.
  WAKU = 3,
  // The `data` field is set to TBD
  RESERVED = 4,
  // The `data` field of the emitted `Proof` struct contains the IPFS address (`bytes32`) of the proofs + conditional order parameters.
  IPFS = 5,
}

/**
 * A factory and it's arguments that are called at transaction mining time to generate the context
 * for a conditional order(s).
 *
 * This allows to support the case where conditional orders may want to *commence* validity at the
 * time of transaction mining, like in the case of a `TWAP` executed by a DAO or `Safe` that takes
 * a reasonable amount of time to aggregate signatures or collect votes.
 *
 * @remarks This is used in conjunction with `setRootWithContext` or `createWithContext`.
 */
export type ContextFactory = {
  // The address of the `IValueFactory` that will be used to resolve the context.
  address: string
  // Any arguments that will be passed to the `IValueFactory` to resolve the context.
  factoryArgs?: {
    args: any[]
    argsType: string[]
  }
}

/**
 * A struct for a proof that can be used with `setRoot` and `setRootWithContext` on a
 * ComposableCoW-enabled Safe.
 */
export type ProofStruct = {
  // The location of the proof.
  location: ProofLocation
  // The data for the proof.
  data: string | '0x'
}

/**
 * Payload for emitting a merkle root to a ComposableCoW-enabled Safe.
 *
 * If setting `ProofLocation.EMITTED`, this type should be used as the `data` in the `Proof` struct.
 */
export type PayloadLocationEmitted = {
  // An array of conditional orders and their proofs.
  proofs: ProofWithParams[]
}

/**
 * A proof for a conditional order and it's parameters.
 */
export type ProofWithParams = {
  // The proof for the Merkle tree that contains the conditional order.
  proof: string[]
  // The parameters for the conditional order.
  params: ConditionalOrderParams
}

/**
 * Multiplexer for conditional orders - using `ComposableCoW`!
 *
 * This class provides functionality to:
 * - Generate a merkle tree of conditional orders
 * - Generate off-chain proofs for all orders in the merkle tree
 * - Save off-chain proofs, with the ability to omit / skip specific conditional orders
 * - Propose `create` and `setRoot` to a ComposableCoW-enabled Safe
 * - BONUS: Upload proofs to IPFS or Swarm and use the location within the ProofStruct to direct indexers.
 */
export class Multiplexer {
  public chain: SupportedChainId
  public location?: ProofLocation

  private orders: Record<string, BaseConditionalOrder<any>> = {}
  private tree: StandardMerkleTree<string[]>
  private ctx: string | undefined = undefined

  /**
   * @param chain The `chainId` for where we're using `ComposableCoW`.
   * @param orders An optional array of conditional orders to initialize the merkle tree with.
   * @param root An optional root to verify against.
   */
  constructor(chain: SupportedChainId, orders: BaseConditionalOrder<any>[] = [], root?: string) {
    this.chain = chain
    this.orders = orders.reduce((acc, order) => {
      acc[order.id] = order
      return acc
    }, {} as Record<string, BaseConditionalOrder<any>>)
    this.tree = StandardMerkleTree.of(
      orders.map((o) => [o.handler, o.salt, o.encodeStaticInput()]),
      CONDITIONAL_ORDER_LEAF_ABI
    )

    // Verify the root if provided
    if (root && root !== this.tree.root) {
      throw new Error('Root mismatch')
    }
  }

  /**
   * Mark a single conditional order as valid.
   * @param order The conditional order for `ComposableCoW` to signal it's intent to trade.
   */
  static create<T>(order: BaseConditionalOrder<T>): Promise<string> {
    throw new Error('Not implemented')
  }

  /**
   * Add a conditional order to the merkle tree.
   * @param order The order to add to the merkle tree.
   */
  add<T>(order: BaseConditionalOrder<T>): void {
    this.orders[order.id] = order
    this.reset()
  }

  /**
   * Remove a conditional order from the merkle tree.
   * @param id The id of the `BaseConditionalOrder` to remove from the merkle tree.
   */
  remove(id: string): void {
    delete this.orders[id]
    this.reset()
  }

  /**
   * Update a given conditional order in the merkle tree.
   * @param id The id of the `BaseConditionalOrder` to update.
   * @param updater A function that takes the existing `BaseConditionalOrder` and context, returning an updated `BaseConditionalOrder`.
   */
  update<T>(id: string, updater: (order: BaseConditionalOrder<T>, ctx?: string) => BaseConditionalOrder<T>): void {
    // copy the existing order and update it, given the existing context (if any)
    const order = updater(this.orders[id], this.ctx)
    // delete the existing order
    delete this.orders[id]

    // add the updated order
    this.orders[order.id] = order
    this.reset()
  }

  /**
   * Generate the merkle tree for the current set of conditional orders.
   *
   * **CAUTION**: This will overwrite any existing merkle tree. This operation is expensive and should only be done when necessary.
   * @throws If the merkle tree cannot be generated.
   */
  generate(): void {
    this.tree = StandardMerkleTree.of(
      Object.values(this.orders).map((order) => [...Object.values(order.leaf)]),
      CONDITIONAL_ORDER_LEAF_ABI
    )
  }

  /**
   * Encode the proofs and their parameters for emitting from ComposableCoW.
   * @param filter {@link getProofs}
   * @returns An ABI-encoded payload to be used in the `Proof` struct.
   */
  encodeProofs(filter?: (v: any) => boolean): string {
    throw new Error('Not implemented')
    const proofs = this.getProofs(filter)

    return utils.defaultAbiCoder.encode(PAYLOAD_EMITTED_ABI, proofs)
  }

  /**
   * Get the proofs with parameters for the conditional orders in the merkle tree.
   * @param filter A function that takes a conditional order and returns a boolean indicating
   *               whether the order should be included in the proof.
   * @returns An array of proofs and their order's parameters for the conditional orders in the
   *          merkle tree.
   */
  getProofs(filter?: (v: string[]) => boolean): ProofWithParams[] {
    if (!this.tree) {
      throw new Error('Merkle tree not generated')
    }

    // Get a list of all entry indices in the tree, excluding any that don't match the filter
    return [...this.tree.entries()]
      .map(([i, v]) => {
        if ((filter && filter(v)) || filter === undefined) {
          return { idx: i, value: v }
        } else {
          return undefined
        }
      })
      .reduce((acc: ProofWithParams[], x) => {
        if (x) {
          acc.push({
            proof: this.tree.getProof(x.idx),
            params:
              this.orders[
                BaseConditionalOrder.leafToId({ handler: x.value[0], salt: x.value[1], staticInput: x.value[2] })
              ],
          })
        }
        return acc
      }, [])
  }

  /**
   * A helper to reset the merkle tree.
   */
  private reset(): void {
    this.tree = StandardMerkleTree.of([], CONDITIONAL_ORDER_LEAF_ABI)
  }
}
