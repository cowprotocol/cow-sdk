import { getGlobalAdapter } from '@cowprotocol/sdk-common'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'

import { QuoteBridgeRequest } from '../../types'
import { COW_SHED_PROXY_CREATION_GAS, DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION } from '../../const'

export async function getGasLimitEstimationForHook(
  cowShedSdk: CowShedSdk,
  request: QuoteBridgeRequest,
  extraGas?: number,
): Promise<number> {
  const adapter = getGlobalAdapter()

  const proxyAddress = cowShedSdk.getCowShedAccount(request.sellTokenChainId, request.owner || request.account)
  const proxyCode = await adapter.getCode(proxyAddress)

  // Proxy is not deployed
  if (!proxyCode || proxyCode === '0x') {
    return DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + COW_SHED_PROXY_CREATION_GAS
  }

  // Some bridges require extra gas to be added to the hook.
  if (extraGas && extraGas > 0) {
    return DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + extraGas
  }

  return DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION
}
