import { ADDITIONAL_TARGET_CHAINS_MAP, ALL_SUPPORTED_CHAINS_MAP } from './const'
import { AdditionalEvmTargetChainId, ChainId, ChainInfo, SupportedEvmChainId, TargetEvmChainId } from './types'

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
export function isSupportedChain(chainId: ChainId): chainId is SupportedEvmChainId {
  return chainId in ALL_SUPPORTED_CHAINS_MAP
}

/**
 * Check if the chain is supported by the bridge providers.
 */
export function isAdditionalTargetChain(chainId: ChainId): chainId is AdditionalEvmTargetChainId {
  return chainId in ADDITIONAL_TARGET_CHAINS_MAP
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
