import { OrderSigningUtils, UnsignedOrder } from '@cowprotocol/sdk-order-signing'
import {
  BARN_ETH_FLOW_ADDRESSES,
  ETH_FLOW_ADDRESSES,
  MAX_VALID_TO_EPOCH,
  ProtocolOptions,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/sdk-config'
import type { ContractsOrder as Order } from '@cowprotocol/sdk-contracts-ts'
import { EthFlowOrderExistsCallback } from './types'
import { unsignedOrderForSigning } from './utils/order'

export interface UniqueOrderIdResult {
  orderId: string
  /**
   * The order that actually produced `orderId`. On a collision this differs from the
   * `order` argument (its `buyAmount` has been nudged) — callers MUST build the on-chain
   * transaction from this order, not from their original input, or they'll recreate the
   * exact order that was just detected as colliding.
   */
  order: UnsignedOrder
}

export async function calculateUniqueOrderId(
  chainId: SupportedChainId,
  order: UnsignedOrder,
  checkEthFlowOrderExists?: EthFlowOrderExistsCallback,
  options?: ProtocolOptions,
): Promise<UniqueOrderIdResult> {
  const { env, ethFlowContractOverride } = options ?? {}
  const { orderDigest, orderId } = await OrderSigningUtils.generateOrderId(
    chainId,
    {
      ...unsignedOrderForSigning(order),
      validTo: MAX_VALID_TO_EPOCH,
      sellToken: WRAPPED_NATIVE_CURRENCIES[chainId].address,
    } as Order,
    {
      owner:
        ethFlowContractOverride?.[chainId] ??
        (env === 'staging' ? BARN_ETH_FLOW_ADDRESSES[chainId] : ETH_FLOW_ADDRESSES[chainId]),
    },
    options,
  )

  if (checkEthFlowOrderExists && (await checkEthFlowOrderExists(orderId, orderDigest))) {
    console.error('ETH FLOW', '[calculateUniqueOrderId] ❌ Collision detected: ' + orderId, {
      sellAmount: order.sellAmount,
      fee: order.feeAmount,
    })

    // Recursive call, increment one fee until we get an unique order Id
    return calculateUniqueOrderId(
      chainId,
      adjustAmounts(order),
      checkEthFlowOrderExists,
      options,
    )
  }

  return { orderId, order }
}

function adjustAmounts(order: UnsignedOrder): UnsignedOrder {
  const buyAmount = BigInt(order.buyAmount)

  // On fee=0, fee is, well, 0. Thus, we cannot shift amounts around and remain with the exact same price.
  // Also, we don't want to touch the sell amount.
  // If we move it down, the price might become "too good", if we move it up, the user might not have enough funds!
  // Thus, we make the buy amount a tad bit worse by 1 wei.
  if (buyAmount <= BigInt(1)) {
    // A zero (or negative, on a second collision) buyAmount can't be nudged further down
    // without producing an invalid order — fail loudly instead of silently building a
    // transaction with buyAmount 0 (or a BigInt that can't encode as uint256).
    throw new Error(
      `[calculateUniqueOrderId] Cannot resolve order-id collision: buyAmount (${order.buyAmount}) is too small to adjust further`,
    )
  }

  return { ...order, buyAmount: (buyAmount - BigInt(1)).toString() }
}
