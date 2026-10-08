import { ETH_ADDRESS } from '@cowprotocol/sdk-config'
import { Order } from './generated'
import { EnrichedOrder } from './types'

/**
 * Apply programmatic transformations to an order.
 *
 * For example, transformations may be applied to an order to recognise it as a Native EthFlow order.
 * @param order to apply transformations to
 * @returns An order with the total fee added.
 */
export function transformOrder(order: Order): EnrichedOrder {
  return transformEthFlowOrder(addTotalFeeToOrder(fillMissingFeeAmounts(order)))
}

/**
 * Fill in the fee amounts the Solana order-book leaves out.
 *
 * No component charges a fee on Solana, so its `Order` schema has no `feeAmount`,
 * `executedFeeAmount` or `executedSellAmountBeforeFees` at all, while this type — generated from
 * the EVM spec — declares all three as required. Zero is the true value, and filling it in here
 * keeps consumers from reading `undefined` off a field the type promises.
 *
 * A no-op for EVM orders, which always carry the three fields.
 */
function fillMissingFeeAmounts(order: Order): Order {
  const { feeAmount, executedFeeAmount, executedSellAmount, executedSellAmountBeforeFees } = order

  return {
    ...order,
    feeAmount: feeAmount ?? '0',
    executedFeeAmount: executedFeeAmount ?? '0',
    // With no fee deducted, what was sold before fees is what was sold.
    executedSellAmountBeforeFees: executedSellAmountBeforeFees ?? executedSellAmount,
  }
}

/**
 * Add the total fee to the order.
 *
 * The total fee of the order will be represented by the `totalFee` field, which is the sum of `executedFee`
 * and `executedFeeAmount`.
 *
 * Note that either `executedFee` or `executedFeeAmount` may be `0`, or both might have a non `0` value.
 *
 * See https://cowservices.slack.com/archives/C036G0J90BU/p1705322037866779?thread_ts=1705083817.684659&cid=C036G0J90BU
 *
 * @param dto The order to add the total fee to.
 * @returns The order with the total fee added.
 */
function addTotalFeeToOrder(dto: Order): EnrichedOrder {
  const { executedFeeAmount, executedFee } = dto

  const _executedFeeAmount = BigInt(executedFeeAmount || '0')
  const _executedFee = BigInt(executedFee || '0')

  const totalFee = String(_executedFeeAmount + _executedFee)

  return {
    ...dto,
    totalFee,
  }
}

/**
 * Transform order field for Native EthFlow orders
 *
 * A no-op for regular orders
 * For Native EthFlow, due to how the contract is setup:
 * - sellToken set to Native token address
 * - owner set to `onchainUser`
 * - validTo set to `ethflowData.userValidTo`
 */
function transformEthFlowOrder(order: EnrichedOrder): EnrichedOrder {
  const { ethflowData } = order

  if (!ethflowData) {
    return order
  }

  const { userValidTo: validTo } = ethflowData
  const owner = order.onchainUser || order.owner
  const sellToken = ETH_ADDRESS

  return { ...order, validTo, owner, sellToken }
}
