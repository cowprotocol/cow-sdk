import { latest } from '@cowprotocol/sdk-app-data'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../const'

export function getHookMockForCostEstimation(gasLimit: number): latest.CoWHook {
  return {
    callData: '0x00',
    gasLimit: gasLimit.toString(),
    target: '0x0000000000000000000000000000000000000000',
    dappId: HOOK_DAPP_BRIDGE_PROVIDER_PREFIX,
  }
}

export function areHooksEqual(hookA: latest.CoWHook, hookB: latest.CoWHook): boolean {
  return hookA.callData === hookB.callData && hookA.gasLimit === hookB.gasLimit && hookA.target === hookB.target
}
