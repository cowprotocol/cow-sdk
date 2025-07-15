import { latest } from '@cowprotocol/app-data'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../bridging/const'

export function getHookMockForCostEstimation(gasLimit: number): latest.CoWHook {
  return {
    callData: '0x00',
    gasLimit: gasLimit.toString(),
    target: '0x0000000000000000000000000000000000000000',
    dappId: HOOK_DAPP_BRIDGE_PROVIDER_PREFIX,
  }
}
