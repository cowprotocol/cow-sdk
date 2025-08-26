import { QuoteBridgeRequest } from '../../types'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { COW_SHED_PROXY_CREATION_GAS, DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION } from '../../const'
import { CowShedSdk } from '../../../cow-shed'

export async function getGasLimitEstimationForHook(
  cowShedSdk: CowShedSdk,
  request: QuoteBridgeRequest,
  provider: JsonRpcProvider,
  extraGas?: number,
): Promise<number> {
  const proxyAddress = cowShedSdk.getCowShedAccount(request.sellTokenChainId, request.owner || request.account)
  const proxyCode = await provider.getCode(proxyAddress)

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
