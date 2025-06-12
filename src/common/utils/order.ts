import type { OrderBalance } from '@cowprotocol/contracts'
import { UnsignedOrder } from '../../order-signing'
import type { Order } from '@cowprotocol/contracts'

export function getOrderDeadlineFromNow(validFor: number): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + validFor)
}
export function unsignedOrderForSigning(order: UnsignedOrder): Order {
  return {
    ...order,
    sellTokenBalance: order.sellTokenBalance as string as OrderBalance,
    buyTokenBalance: order.buyTokenBalance as string as OrderBalance,
  }
}
