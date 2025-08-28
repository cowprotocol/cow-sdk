import { getGlobalAdapter } from '@cowprotocol/sdk-common'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'

import { QuoteBridgeRequest } from '../../types'
import { COW_SHED_PROXY_CREATION_GAS, DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION } from '../../const'

export async function getGasLimitEstimationForHook({
  cowShedSdk,
  request,
  extraGas,
  extraGasProxyCreation,
}: {
  cowShedSdk: CowShedSdk
  request: QuoteBridgeRequest
  extraGas?: number
  extraGasProxyCreation?: number
}): Promise<number> {
  const adapter = getGlobalAdapter()

  const proxyAddress = cowShedSdk.getCowShedAccount(request.sellTokenChainId, request.owner || request.account)
  const proxyCode = await adapter.getCode(proxyAddress)

  // Proxy is not deployed
  if (!proxyCode || proxyCode === '0x') {
    const baseGas = DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + COW_SHED_PROXY_CREATION_GAS
    return baseGas + (extraGasProxyCreation && extraGasProxyCreation > 0 ? extraGasProxyCreation : 0)
  }

  return DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + (extraGas && extraGas > 0 ? extraGas : 0)
}
