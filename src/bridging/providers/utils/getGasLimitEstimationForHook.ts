import { QuoteBridgeRequest } from '../../types'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { COW_SHED_PROXY_CREATION_GAS, DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION } from '../../const'
import { CowShedSdk } from '../../../cow-shed'

export async function getGasLimitEstimationForHook(
  cowShedSdk: CowShedSdk,
  request: QuoteBridgeRequest,
  provider: JsonRpcProvider,
): Promise<number> {
  const proxyAddress = cowShedSdk.getCowShedAccount(request.sellTokenChainId, request.owner || request.account)
  const proxyCode = await provider.getCode(proxyAddress)

  // Proxy is not deployed
  if (!proxyCode || proxyCode === '0x') {
    return DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + COW_SHED_PROXY_CREATION_GAS
  }

  return DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION
}
