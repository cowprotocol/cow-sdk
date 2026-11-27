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
   * The order to use for the transaction, including any collision adjustment.
   */
  order: UnsignedOrder
}

/**
 * Computes an ID using EthFlow-normalized fields: maximum validity, wrapped native sell token and contract owner.
 * Checks collisions only when `checkEthFlowOrderExists` is supplied, reducing `buyAmount` by one base unit per retry.
 * Adjustment throws if the buy amount cannot remain positive.
 * Callers must build the transaction from the returned order.
 */
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

    // Retry with buyAmount decreased by one base unit.
    return calculateUniqueOrderId(
      chainId,
      adjustAmounts(order),
      checkEthFlowOrderExists,
      options,
    )
  }

  return { orderId, order }
}

/**
 * Nudges `buyAmount` down by one base unit, slightly worsening the requested price.
 * With zero fees there is no fee amount to shift. Keeping `sellAmount` fixed avoids
 * a harder-to-fill price from reducing it or requiring more native funds from increasing it.
 * Throws if the adjusted buy amount would be nonpositive.
 */
function adjustAmounts(order: UnsignedOrder): UnsignedOrder {
  const buyAmount = BigInt(order.buyAmount)

  if (buyAmount <= BigInt(1)) {
    throw new Error(
      `[calculateUniqueOrderId] Cannot resolve order-id collision: buyAmount (${order.buyAmount}) is too small to adjust further`,
    )
  }

  return { ...order, buyAmount: (buyAmount - BigInt(1)).toString() }
}
