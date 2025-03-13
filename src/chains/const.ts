import { ChainInfo, SupportedChainId } from '../common/types/chains'

import { mainnet } from './details/mainnet'
import { gnosisChain } from './details/gnosis'
import { arbitrumOne } from './details/arbitrum'
import { base } from './details/base'
import { sepolia } from './details/sepolia'

import { RAW_FILES_PATH } from '../common/consts/path'

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
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = ALL_SUPPORTED_CHAINS.map(
  (chain) => chain.id
) as SupportedChainId[]
