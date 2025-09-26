import { arbitrumOne, avalanche, base, bnb, gnosisChain, mainnet, optimism, polygon } from '@cowprotocol/sdk-config'

import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../../../const'

import { BridgeStatus } from '../../../types'

export const NEAR_INTENTS_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/near-intents`

export const NEAR_INTENTS_SUPPORTED_NETWORKS = [
  arbitrumOne,
  avalanche,
  base,
  bnb,
  gnosisChain,
  mainnet,
  optimism,
  polygon,
]

export type NearBlockchainKey = 'arb' | 'avax' | 'base' | 'bsc' | 'eth' | 'gnosis' | 'op' | 'pol'

export const NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS = {
  arb: arbitrumOne.id,
  avax: avalanche.id,
  base: base.id,
  bsc: bnb.id,
  eth: mainnet.id,
  gnosis: gnosisChain.id,
  op: optimism.id,
  pol: polygon.id,
} as const satisfies Record<NearBlockchainKey, number>

export const NEAR_INTENTS_STATUS_TO_COW_STATUS: Record<string, BridgeStatus> = {
  KNOWN_DEPOSIT_TX: BridgeStatus.IN_PROGRESS,
  PENDING_DEPOSIT: BridgeStatus.IN_PROGRESS,
  INCOMPLETE_DEPOSIT: BridgeStatus.UNKNOWN,
  PROCESSING: BridgeStatus.IN_PROGRESS,
  SUCCESS: BridgeStatus.EXECUTED,
  REFUNDED: BridgeStatus.REFUND,
  FAILED: BridgeStatus.UNKNOWN,
}
