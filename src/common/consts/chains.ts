import { mainnet } from 'src/chains/mainnet'
import { ChainInfo, SupportedChainId } from '../types/chains'
import { gnosisChain } from '../../chains/gnosis'
import { arbitrumOne } from 'src/chains/arbitrum'
import { base } from 'src/chains/base'
import { sepolia } from 'src/chains/sepolia'

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
