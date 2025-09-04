import {
  arbitrumOne,
  avalanche,
  base,
  bnb,
  ChainInfo,
  gnosisChain,
  mainnet,
  optimism,
  polygon,
} from '@cowprotocol/sdk-config'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../../../const'
import type { Hex } from 'viem'
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

export const NEAR_INTENTS_BLOCKCHAIN_TO_COW_NETWORK: Record<string, ChainInfo> = {
  arb: arbitrumOne,
  avax: avalanche,
  base,
  bsc: bnb,
  eth: mainnet,
  gnosis: gnosisChain,
  op: optimism,
  pol: polygon,
}

export const NEAR_INTENTS_BLOCKCHAIN_TO_NATIVE_WRAPPED_TOKEN_ADDRESS: Record<string, Hex> = {
  arb: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth on arb
  avax: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // wavax on avax
  base: '0x4200000000000000000000000000000000000006', // weth on base
  bsc: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // wbnb on bsc
  eth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // weth on et
  gnosis: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // wxdai on gnosis
  op: '0x4200000000000000000000000000000000000006', // weth on op
  pol: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // wpol on pol
}

export const NEAR_INTENTS_STATUS_TO_COW_STATUS: Record<string, BridgeStatus> = {
  KNOWN_DEPOSIT_TX: BridgeStatus.IN_PROGRESS,
  PENDING_DEPOSIT: BridgeStatus.IN_PROGRESS,
  INCOMPLETE_DEPOSIT: BridgeStatus.UNKNOWN,
  PROCESSING: BridgeStatus.IN_PROGRESS,
  SUCCESS: BridgeStatus.EXECUTED,
  REFUNDED: BridgeStatus.REFUND,
  FAILED: BridgeStatus.UNKNOWN,
}
