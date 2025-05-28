import { Abi, getGlobalAdapter } from '@cowprotocol/sdk-common'

/**
 * Grants the required roles to the specified Vault relayer.
 *
 * This method is intended to be called by the Balancer Vault admin, and **not**
 * traders. It is included in the exported TypeScript library for completeness
 * and "documentation".
 *
 * @param authorizerAddress The address of the Vault authorizer contract that manages access.
 * @param authorizerAbi The ABI of the authorizer contract.
 * @param vaultAddress The address to the Vault.
 * @param vaultRelayerAddress The address to the GPv2 Vault relayer contract.
 * @param contractCall Function to execute the contract call (provided by the adapter).
 */
export async function grantRequiredRoles(
  authorizerAddress: string,
  authorizerAbi: Abi,
  vaultAddress: string,
  vaultRelayerAddress: string,
  contractCall: (address: string, abi: Abi, functionName: string, args: unknown[]) => Promise<void>,
): Promise<void> {
  return getGlobalAdapter().utils.grantRequiredRoles(
    authorizerAddress,
    authorizerAbi,
    vaultAddress,
    vaultRelayerAddress,
    contractCall,
  )
}
