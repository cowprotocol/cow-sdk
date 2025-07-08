import { latest } from '@cowprotocol/app-data'

export function getHookMockForCostEstimation(gasLimit: number): latest.CoWHook {
  return {
    callData: '0x00',
    gasLimit: gasLimit.toString(),
    target: '0x0000000000000000000000000000000000000000',
  }
}

export function areHooksEqual(hookA: latest.CoWHook, hookB: latest.CoWHook): boolean {
  return hookA.callData === hookB.callData && hookA.gasLimit === hookB.gasLimit && hookA.target === hookB.target
}
