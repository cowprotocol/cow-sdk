import { getGlobalAdapter } from '@cowprotocol/sdk-common'

/**
 * Compute the deterministic CREATE2 address for an OrderFlow contract
 * deployed by the OrderFlowFactory for a given owner.
 *
 * The factory uses: CREATE2(factory, keccak256(owner), initCodeHash)
 *
 * @param factoryAddress - Address of the OrderFlowFactory on the destination chain
 * @param owner - The user's address (used as salt for CREATE2)
 * @param initCodeHash - The keccak256 hash of the OrderFlow contract init code
 */
export function computeOrderFlowAddress(
  factoryAddress: string,
  owner: string,
  initCodeHash: string,
): string {
  const adapter = getGlobalAdapter()

  // The salt is the keccak256 hash of the owner address padded to bytes32
  const salt = adapter.utils.keccak256(
    adapter.utils.encodeAbi(['address'], [owner]) as string,
  )

  return adapter.utils.getCreate2Address(factoryAddress, salt, initCodeHash)
}
