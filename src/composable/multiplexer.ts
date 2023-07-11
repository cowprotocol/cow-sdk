import { SupportedChainId } from '../common'

export type ContextArgs = {
  args: any[]
  argsType: string[]
}

export type Context = {
  // The address of the `IValueFactory` that will be used to resolve the context.
  address: string
  // Any arguments that will be passed to the `IValueFactory` to resolve the context.
  args: ContextArgs | undefined
}

export class Multiplexer {
  public chain: SupportedChainId

  // Loading / saving a MerkleRoot of IConditionalOrders
  // Generate off-chain proofs for all orders in the MerkleTree
  // Save off-chain proofs, with the ability to omit / skip specific IConditionalOrders.
  // Add / delete / update an IConditionalOrder within a MerkleTree and regenerate proofs.
  // Propose create and setRoot to a ComposableCoW-enabled Safe.
  // BONUS: Upload proofs to IPFS or Swarm and use the location within the ProofStruct to direct indexers.

  constructor(chain: SupportedChainId) {
    this.chain = chain
  }
}
