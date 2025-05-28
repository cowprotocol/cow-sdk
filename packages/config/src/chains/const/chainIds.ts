import { SupportedChainId } from '../types'
import { mainnet } from '../details/mainnet'
import { gnosisChain } from '../details/gnosis'
import { arbitrumOne } from '../details/arbitrum'
import { base } from '../details/base'
import { sepolia } from '../details/sepolia'
import { avalanche } from '../details/avalanche'
import { polygon } from '../details/polygon'

/**
 * The list of supported chains.
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  mainnet.id,
  gnosisChain.id,
  arbitrumOne.id,
  base.id,
  avalanche.id,
  polygon.id,
  sepolia.id,
]
