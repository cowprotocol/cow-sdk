import type { Order } from '@cowprotocol/contracts'
import type { SupportedChainId } from './common'
import { OrderSigningUtils } from './order-signing'

export async function computeOrderUid(chainId: SupportedChainId, owner: string, order: Order): Promise<string> {
  const { computeOrderUid: _computeOrderUid } = await import('@cowprotocol/contracts')
  const domain = await OrderSigningUtils.getDomain(chainId)

  return _computeOrderUid(domain, order, owner)
}
