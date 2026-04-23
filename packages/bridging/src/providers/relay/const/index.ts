import {
  arbitrumOne,
  avalanche,
  base,
  bnb,
  gnosisChain,
  ink,
  linea,
  mainnet,
  optimism,
  plasma,
  polygon,
} from '@cowprotocol/sdk-config'

import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../../../const'
import { BridgeStatus } from '../../../types'

export const RELAY_API_BASE_URL = 'https://api.relay.link'

export const RELAY_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/relay`

export const RELAY_SUPPORTED_NETWORKS = [
  mainnet,
  optimism,
  base,
  arbitrumOne,
  polygon,
  bnb,
  avalanche,
  linea,
  plasma,
  ink,
  gnosisChain,
]

export const RELAY_SUPPORTED_CHAIN_IDS = new Set(RELAY_SUPPORTED_NETWORKS.map((n) => n.id))

export const RELAY_STATUS_TO_COW_STATUS: Record<string, BridgeStatus> = {
  waiting: BridgeStatus.IN_PROGRESS,
  depositing: BridgeStatus.IN_PROGRESS,
  pending: BridgeStatus.IN_PROGRESS,
  submitted: BridgeStatus.IN_PROGRESS,
  success: BridgeStatus.EXECUTED,
  refund: BridgeStatus.REFUND,
  failure: BridgeStatus.EXPIRED,
}
