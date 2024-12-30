import { ETH_ADDRESS } from '../common/consts'
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
  return transformEthFlowOrder(addTotalFeeToOrder(order))
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
