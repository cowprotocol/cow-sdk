import { AdditionalEvmTargetChainId, ChainInfo, SupportedEvmChainId } from '../types'
import { mainnet } from '../details/mainnet'
import { gnosisChain } from '../details/gnosis'
import { arbitrumOne } from '../details/arbitrum'
import { base } from '../details/base'
import { sepolia } from '../details/sepolia'
import { avalanche } from '../details/avalanche'
import { polygon } from '../details/polygon'
import { lens } from '../details/lens'
import { bnb } from '../details/bnb'
import { optimism } from '../details/optimism'
import { linea } from '../details/linea'
import { plasma } from '../details/plasma'
import { ink } from '../details/ink'

/**
 * Details of all supported chains.
 */
export const ALL_SUPPORTED_CHAINS_MAP: Record<SupportedEvmChainId, ChainInfo> = {
  [SupportedEvmChainId.MAINNET]: mainnet,
  [SupportedEvmChainId.GNOSIS_CHAIN]: gnosisChain,
  [SupportedEvmChainId.ARBITRUM_ONE]: arbitrumOne,
  [SupportedEvmChainId.BASE]: base,
  [SupportedEvmChainId.AVALANCHE]: avalanche,
  [SupportedEvmChainId.POLYGON]: polygon,
  [SupportedEvmChainId.BNB]: bnb,
  [SupportedEvmChainId.LENS]: lens,
  [SupportedEvmChainId.PLASMA]: plasma,
  [SupportedEvmChainId.LINEA]: linea,
  [SupportedEvmChainId.INK]: ink,
  [SupportedEvmChainId.SEPOLIA]: sepolia,
}

/**
 * All supported chains.
 */
export const ALL_SUPPORTED_CHAINS = Object.values(ALL_SUPPORTED_CHAINS_MAP)

/**
 * The list of supported chains.
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedEvmChainId[] = ALL_SUPPORTED_CHAINS.map(
  (chain) => chain.id,
) as SupportedEvmChainId[]

/**
 * Maps a chain where you can bridge to, but not sell tokens from (not supported by CoW Protocol)
 */
export const ADDITIONAL_TARGET_CHAINS_MAP: Record<AdditionalEvmTargetChainId, ChainInfo> = {
  [AdditionalEvmTargetChainId.OPTIMISM]: optimism,
}

/**
 * All chains (both supported by CoW Protocol, or chains where you can bridge to)
 */
export const ALL_CHAINS = ALL_SUPPORTED_CHAINS.concat(Object.values(ADDITIONAL_TARGET_CHAINS_MAP))

/**
 * All chain ids (both supported by CoW Protocol, or chains where you can bridge to)
 */
export const ALL_CHAINS_IDS = ALL_CHAINS.map((chain) => chain.id)
