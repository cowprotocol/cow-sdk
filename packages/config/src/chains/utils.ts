import { ADDITIONAL_TARGET_CHAINS_MAP, ALL_SUPPORTED_CHAINS_MAP } from './const'
import { AdditionalEvmTargetChainId, ChainId, ChainInfo, SupportedEvmChainId, TargetEvmChainId } from './types'

/**
 * Type guard to check if a chain ID represents an EVM chain.
 * EVM chains use numeric chain IDs, while non-EVM chains (Bitcoin, Solana) use string identifiers.
 *
 * @param chainId - The chain ID to check
 * @returns True if the chain ID is a number (EVM chain), false otherwise
 */
export function isEvmChain(chainId: ChainId): chainId is number {
  return typeof chainId === 'number'
}

/**
 * Return the chain info for a given chain id or undefined if the chain is not known (not supported by CoW Protocol or the bridge providers).
 * @param chainId
 */
export function getChainInfo(chainId: ChainId): ChainInfo | undefined {
  if (isSupportedChain(chainId)) {
    return ALL_SUPPORTED_CHAINS_MAP[chainId]
  }

  if (isAdditionalTargetChain(chainId)) {
    return ADDITIONAL_TARGET_CHAINS_MAP[chainId]
  }

  // Unknown chain
  return undefined
}

/**
 * Check if the chain is supported by CoW Protocol.
 * Only works for EVM chains (numeric chain IDs).
 */
export function isSupportedChain(chainId: ChainId): chainId is SupportedEvmChainId {
  return isEvmChain(chainId) && chainId in ALL_SUPPORTED_CHAINS_MAP
}

/**
 * Check if the chain is supported by the bridge providers.
 * Only works for EVM chains (numeric chain IDs).
 */
export function isAdditionalTargetChain(chainId: ChainId): chainId is AdditionalEvmTargetChainId {
  return isEvmChain(chainId) && chainId in ADDITIONAL_TARGET_CHAINS_MAP
}

/**
 * Check if the chain is supported by CoW Swap or the bridge providers.
 */
export function isTargetEvmChainId(chainId: ChainId): chainId is TargetEvmChainId {
  return isSupportedChain(chainId) || isAdditionalTargetChain(chainId)
}

export function isZkSyncChain(chainId: ChainId): boolean {
  return Boolean(getChainInfo(chainId)?.isZkSync)
}

/**
 * Check if the chain is under development.
 * @param chainId
 */
export function isChainUnderDevelopment(chainId: ChainId): boolean {
  return Boolean(getChainInfo(chainId)?.isUnderDevelopment)
}
