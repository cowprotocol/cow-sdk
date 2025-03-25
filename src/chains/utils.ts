import { ADDITIONAL_TARGET_CHAINS_MAP, ALL_SUPPORTED_CHAINS_MAP } from './const'
import { AdditionalTargetChainId, ChainId, ChainInfo, SupportedChainId, TargetChainId } from './types'

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
  return chainId in ALL_SUPPORTED_CHAINS_MAP
}

/**
 * Check if the chain is supported by the bridge providers.
 */
export function isAdditionalTargetChain(chainId: ChainId): chainId is AdditionalTargetChainId {
  return chainId in ADDITIONAL_TARGET_CHAINS_MAP
}

/**
 * Check if the chain is supported by CoW Swap or the bridge providers.
 */
export function isTargetChainId(chainId: ChainId): chainId is TargetChainId {
  return isSupportedChain(chainId) || isAdditionalTargetChain(chainId)
}
