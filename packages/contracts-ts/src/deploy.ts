import { getGlobalAdapter, type Abi, type Address } from '@cowprotocol/sdk-common'

/**
 * The salt used when deterministically deploying smart contracts.
 * SALT = ethers.utils.formatBytes32String("Mattresses in Berlin!");
 */
export const SALT = '0x4d61747472657373657320696e204265726c696e210000000000000000000000'

/**
 * The contract used to deploy contracts deterministically with CREATE2.
 * The address is chosen by the hardhat-deploy library.
 * It is the same in any EVM-based network.
 *
 * https://github.com/Arachnid/deterministic-deployment-proxy
 */
export const DEPLOYER_CONTRACT = '0x4e59b44847b379578588920ca78fbf26c0b4956c'

/**
 * Dictionary containing all deployed contract names.
 */
export const CONTRACT_NAMES = {
  authenticator: 'GPv2AllowListAuthentication',
  settlement: 'GPv2Settlement',
  tradeSimulator: 'GPv2TradeSimulator',
} as const

/**
 * The name of a deployed contract.
 */
export type ContractName = (typeof CONTRACT_NAMES)[keyof typeof CONTRACT_NAMES]

/**
 * The deployment args for a contract.
 */
export type DeploymentArguments<T> = T extends typeof CONTRACT_NAMES.authenticator
  ? never
  : T extends typeof CONTRACT_NAMES.settlement
    ? [string, string]
    : T extends typeof CONTRACT_NAMES.tradeSimulator
      ? []
      : unknown[]

/**
 * Artifact information important for computing deterministic deployments.
 */
export interface ArtifactDeployment {
  abi: Abi
  bytecode: string
}

/**
 * An artifact with a contract name matching one of the deterministically
 * deployed contracts.
 */
export interface NamedArtifactDeployment<C extends ContractName> extends ArtifactDeployment {
  contractName: C
}

export type MaybeNamedArtifactArtifactDeployment<C> = C extends ContractName
  ? NamedArtifactDeployment<C>
  : ArtifactDeployment

/**
 * Computes the deterministic address at which the contract will be deployed.
 * This address does not depend on which network the contract is deployed to.
 *
 * @param contractName Name of the contract for which to find the address.
 * @param deploymentArguments Extra arguments that are necessary to deploy.
 * @returns The address that is expected to store the deployed code.
 */
export function deterministicDeploymentAddress<C>(
  { bytecode }: MaybeNamedArtifactArtifactDeployment<C>,
  deploymentArguments: DeploymentArguments<C>,
): Address {
  const adapter = getGlobalAdapter()

  const bytecodeHash = adapter.utils.keccak256(adapter.utils.hexConcat([bytecode, ...deploymentArguments]))

  return adapter.utils.getCreate2Address(DEPLOYER_CONTRACT, SALT, bytecodeHash)
}
