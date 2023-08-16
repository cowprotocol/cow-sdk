import { providers } from 'ethers'
import {
  COMPOSABLE_COW_CONTRACT_ADDRESS,
  EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS,
  SupportedChainId,
} from '../common'
import { ExtensibleFallbackHandler__factory } from './generated'

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
