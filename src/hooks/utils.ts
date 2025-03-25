import { latest } from '@cowprotocol/app-data'

export function getHookMockForCostEstimation(gasLimit: number): latest.OrderInteractionHooks {
  return {
    post: [
      {
        callData: '0x00',
        gasLimit: gasLimit.toString(),
        target: '0x0000000000000000000000000000000000000000',
      },
    ],
  }
}
