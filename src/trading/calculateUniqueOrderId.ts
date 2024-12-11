import { OrderSigningUtils, UnsignedOrder } from '../order-signing'
import {
  BARN_ETH_FLOW_ADDRESSES,
  CowEnv,
  ETH_FLOW_ADDRESSES,
  MAX_VALID_TO_EPOCH,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '../common'
import type { Order, OrderBalance } from '@cowprotocol/contracts'

export interface EthFlowOrderExistsCallback {
  (orderId: string, orderDigest: string): Promise<boolean>
}

export async function calculateUniqueOrderId(
  chainId: SupportedChainId,
  order: UnsignedOrder,
  checkEthFlowOrderExists?: EthFlowOrderExistsCallback,
  env?: CowEnv
): Promise<string> {
  const { orderDigest, orderId } = await OrderSigningUtils.generateOrderId(
    chainId,
    {
      ...order,
      sellTokenBalance: order.sellTokenBalance as string as OrderBalance,
      buyTokenBalance: order.buyTokenBalance as string as OrderBalance,
      validTo: MAX_VALID_TO_EPOCH,
      sellToken: WRAPPED_NATIVE_CURRENCIES[chainId],
    } as Order,
    {
      owner: (env === 'staging' ? BARN_ETH_FLOW_ADDRESSES : ETH_FLOW_ADDRESSES)[chainId],
    }
  )

  if (checkEthFlowOrderExists && (await checkEthFlowOrderExists(orderId, orderDigest))) {
    console.error('ETH FLOW', '[calculateUniqueOrderId] ❌ Collision detected: ' + orderId, {
      sellAmount: order.sellAmount,
      fee: order.feeAmount,
    })

    // Recursive call, increment one fee until we get an unique order Id
    return calculateUniqueOrderId(chainId, adjustAmounts(order), checkEthFlowOrderExists)
  }

  return orderId
}

function adjustAmounts(order: UnsignedOrder): UnsignedOrder {
  const buyAmount = BigInt(order.buyAmount)

  // On fee=0, fee is, well, 0. Thus, we cannot shift amounts around and remain with the exact same price.
  // Also, we don't want to touch the sell amount.
  // If we move it down, the price might become "too good", if we move it up, the user might not have enough funds!
  // Thus, we make the buy amount a tad bit worse by 1 wei.
  // We can only hope this doesn't happen for an order buying 0 a decimals token 🤞
  return { ...order, buyAmount: (buyAmount - BigInt(1)).toString() }
}
