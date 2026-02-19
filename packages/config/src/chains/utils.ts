import { ADDITIONAL_TARGET_CHAINS_MAP, ALL_SUPPORTED_CHAINS_MAP } from './const'
import {
  AdditionalTargetChainId,
  ChainId,
  ChainInfo,
  EvmChains,
  NonEvmChains,
  SupportedChainId,
  TargetChainId,
} from './types'

/**
 * Type guard to check if a chain ID represents an EVM chain.
 *
 * @param chainId - The chain ID to check
 * @returns True if the chain ID is a number (EVM chain), false otherwise
 */
export function isEvmChain(chainId: ChainId): chainId is EvmChains {
  return chainId in EvmChains;
}

/**
 * Type guard to check if a chain ID represents an Non EVM chain
 *
 * @param chainId - The chain ID to check
 * @returns True if the chain ID is chainId is Non EVM chain (EVM chain), false otherwise
 */
export function isNonEvmChain(chainId : ChainId): chainId is NonEvmChains {
  return chainId in NonEvmChains;
}

/**
 * Type guard to check if a chain ID represents an BTC chain
 *
 * @param chainId - The chain ID to check
 * @returns True if the chain ID is chainId is BTC, false otherwise
 */
export function isBtcChain(chainId: ChainId): chainId is NonEvmChains.BITCOIN {
  return chainId === NonEvmChains.BITCOIN;
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
 */
export function isSupportedChain(chainId: ChainId): chainId is SupportedChainId {
  return isEvmChain(chainId) && chainId in ALL_SUPPORTED_CHAINS_MAP
}

/**
 * Check if the chain is supported by the bridge providers.
 */
export function isAdditionalTargetChain(chainId: ChainId): chainId is AdditionalTargetChainId {
  return isEvmChain(chainId) && chainId in ADDITIONAL_TARGET_CHAINS_MAP
}

/**
 * Check if the chain is supported by CoW Swap or the bridge providers.
 */
export function isTargetChainId(chainId: ChainId): chainId is TargetChainId {
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
