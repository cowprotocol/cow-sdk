import { arbitrumOne, avalanche, base, bnb, gnosisChain, mainnet, optimism, polygon, plasma } from '@cowprotocol/sdk-config'

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
  plasma,
]

export type NearBlockchainKey = 'arb' | 'avax' | 'base' | 'bsc' | 'eth' | 'gnosis' | 'op' | 'pol' | 'plasma'

export const NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS = {
  arb: arbitrumOne.id,
  avax: avalanche.id,
  base: base.id,
  bsc: bnb.id,
  eth: mainnet.id,
  gnosis: gnosisChain.id,
  op: optimism.id,
  pol: polygon.id,
  plasma: plasma.id,
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

export const ATTESTATION_PREFIX_CONST = '0x0a773570'
export const ATTESTION_VERSION_BYTE = '0x00'
export const ATTESTATOR_ADDRESS = '0x0073DD100b51C555E41B2a452E5933ef76F42790'
