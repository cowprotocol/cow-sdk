import { utils, providers, BigNumber } from 'ethers'
import {
  COMPOSABLE_COW_CONTRACT_ADDRESS,
  EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS,
  SupportedChainId,
} from '../common'
import { ExtensibleFallbackHandler__factory } from './generated'
import { BlockInfo, ConditionalOrderParams } from './types'

// Define the ABI tuple for the ConditionalOrderParams struct
export const CONDITIONAL_ORDER_PARAMS_ABI = ['tuple(address handler, bytes32 salt, bytes staticInput)']

export const DEFAULT_TOKEN_FORMATTER = (address: string, amount: BigNumber) => `${amount}@${address}`

export function isExtensibleFallbackHandler(handler: string, chainId: SupportedChainId): boolean {
  return handler === EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS[chainId]
}

export function isComposableCow(handler: string, chainId: SupportedChainId): boolean {
  return handler === COMPOSABLE_COW_CONTRACT_ADDRESS[chainId]
}

export async function getDomainVerifier(
  safe: string,
  domain: string,
  chainId: SupportedChainId,
  provider: providers.Provider
): Promise<string> {
  const contract = ExtensibleFallbackHandler__factory.connect(
    EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS[chainId],
    provider
  )
  return await contract.callStatic.domainVerifiers(safe, domain)
}

export function createSetDomainVerifierTx(domain: string, verifier: string): string {
  return ExtensibleFallbackHandler__factory.createInterface().encodeFunctionData('setDomainVerifier', [
    domain,
    verifier,
  ])
}

/**
 * Encode the `ConditionalOrderParams` for the conditional order.
 *
 * @param params The `ConditionalOrderParams` struct representing the conditional order as taken from a merkle tree.
 * @returns The ABI-encoded conditional order.
 * @see ConditionalOrderParams
 */
export function encodeParams(params: ConditionalOrderParams): string {
  return utils.defaultAbiCoder.encode(CONDITIONAL_ORDER_PARAMS_ABI, [params])
}

/**
 * Decode the `ConditionalOrderParams` for the conditional order.
 *
 * @param encoded The encoded conditional order.
 * @returns The decoded conditional order.
 */
export function decodeParams(encoded: string): ConditionalOrderParams {
  const { handler, salt, staticInput } = utils.defaultAbiCoder.decode(CONDITIONAL_ORDER_PARAMS_ABI, encoded)[0]
  return { handler, salt, staticInput }
}

/**
 * Helper method for validating ABI types.
 * @param types ABI types to validate against.
 * @param values The values to validate.
 * @returns {boolean} Whether the values are valid ABI for the given types.
 */
export function isValidAbi(types: readonly (string | utils.ParamType)[], values: any[]): boolean {
  try {
    utils.defaultAbiCoder.encode(types, values)
  } catch (e) {
    return false
  }
  return true
}

export async function getBlockInfo(provider: providers.Provider): Promise<BlockInfo> {
  const block = await provider.getBlock('latest')

  return {
    blockNumber: block.number,
    blockTimestamp: block.timestamp,
  }
}

export function formatEpoch(epoch: number): string {
  return new Date(epoch * 1000).toISOString()
}
