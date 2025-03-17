import { AdditionalTargetChainId, ChainInfo, SupportedChainId } from './types'

import { mainnet } from './details/mainnet'
import { gnosisChain } from './details/gnosis'
import { arbitrumOne } from './details/arbitrum'
import { base } from './details/base'
import { sepolia } from './details/sepolia'

import { RAW_FILES_PATH } from '../common/consts/path'
import { optimism } from './details/optimism'
import { polygon } from './details/polygon'

export const RAW_CHAINS_FILES_PATH = `${RAW_FILES_PATH}/src/chains`

/**
 * Details of all supported chains.
 */
export const ALL_SUPPORTED_CHAINS_MAP: Record<SupportedChainId, ChainInfo> = {
  [SupportedChainId.MAINNET]: mainnet,
  [SupportedChainId.GNOSIS_CHAIN]: gnosisChain,
  [SupportedChainId.ARBITRUM_ONE]: arbitrumOne,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.SEPOLIA]: sepolia,
}

/**
 * All supported chains.
 */
export const ALL_SUPPORTED_CHAINS = Object.values(ALL_SUPPORTED_CHAINS_MAP)

/**
 * The list of supported chains.
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = ALL_SUPPORTED_CHAINS.filter(Boolean).map(
  (chain) => chain.id
) as SupportedChainId[]

/**
 * Maps a chain where you can bridge to, but not sell tokens from (not supported by CoW Protocol)
 */
export const ADDITIONAL_TARGET_CHAINS_MAP: Record<AdditionalTargetChainId, ChainInfo> = {
  [AdditionalTargetChainId.OPTIMISM]: optimism,
  [AdditionalTargetChainId.POLYGON]: polygon,
}

/**
 * All chains (both supported by CoW Protocol, or chains where you can bridge to)
 */
export const ALL_CHAINS = ALL_SUPPORTED_CHAINS.concat(Object.values(ADDITIONAL_TARGET_CHAINS_MAP)).filter(Boolean)

/**
 * All chain ids (both supported by CoW Protocol, or chains where you can bridge to)
 */
export const ALL_CHAINS_IDS = ALL_CHAINS.map((chain) => chain.id)
