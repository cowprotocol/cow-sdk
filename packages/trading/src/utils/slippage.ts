import { SupportedChainId } from '@cowprotocol/sdk-config'

import { DEFAULT_SLIPPAGE_BPS, ETH_FLOW_DEFAULT_SLIPPAGE_BPS } from '../consts'

export function getDefaultSlippageBps(chainId: SupportedChainId, isEthFlow: boolean): number {
  if (isEthFlow) {
    return ETH_FLOW_DEFAULT_SLIPPAGE_BPS[chainId]
  } else {
    return DEFAULT_SLIPPAGE_BPS
  }
}
