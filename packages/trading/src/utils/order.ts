import type { ContractsOrder, OrderBalance } from '@cowprotocol/sdk-contracts-ts'
import type { UnsignedOrder } from '@cowprotocol/sdk-order-signing'

export function getOrderDeadlineFromNow(validFor: number): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + validFor)
}

export function unsignedOrderForSigning(order: UnsignedOrder): ContractsOrder {
  return {
    ...order,
    sellTokenBalance: order.sellTokenBalance as string as OrderBalance,
    buyTokenBalance: order.buyTokenBalance as string as OrderBalance,
  }
}
