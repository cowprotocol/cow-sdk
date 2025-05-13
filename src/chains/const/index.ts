import { AdditionalTargetChainId, ChainInfo, SupportedChainId } from '../types'

import { mainnet } from '../details/mainnet'
import { gnosisChain } from '../details/gnosis'
import { arbitrumOne } from '../details/arbitrum'
import { base } from '../details/base'
import { sepolia } from '../details/sepolia'

import { avalanche } from '../details/avalanche'
import { optimism } from '../details/optimism'
import { polygon } from '../details/polygon'

/**
 * Details of all supported chains.
 */
export const ALL_SUPPORTED_CHAINS_MAP: Record<SupportedChainId, ChainInfo> = {
  [SupportedChainId.MAINNET]: mainnet,
  [SupportedChainId.GNOSIS_CHAIN]: gnosisChain,
  [SupportedChainId.ARBITRUM_ONE]: arbitrumOne,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.AVALANCHE]: avalanche,
  [SupportedChainId.POLYGON]: polygon,
  [SupportedChainId.SEPOLIA]: sepolia,
}

/**
 * All supported chains.
 */
export const ALL_SUPPORTED_CHAINS = Object.values(ALL_SUPPORTED_CHAINS_MAP)

/**
 * The list of supported chains.
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = ALL_SUPPORTED_CHAINS.map(
  (chain) => chain.id
) as SupportedChainId[]

/**
 * Maps a chain where you can bridge to, but not sell tokens from (not supported by CoW Protocol)
 */
export const ADDITIONAL_TARGET_CHAINS_MAP: Record<AdditionalTargetChainId, ChainInfo> = {
  [AdditionalTargetChainId.OPTIMISM]: optimism,
}

/**
 * All chains (both supported by CoW Protocol, or chains where you can bridge to)
 */
export const ALL_CHAINS = ALL_SUPPORTED_CHAINS.concat(Object.values(ADDITIONAL_TARGET_CHAINS_MAP))

/**
 * All chain ids (both supported by CoW Protocol, or chains where you can bridge to)
 */
export const ALL_CHAINS_IDS = ALL_CHAINS.map((chain) => chain.id)
