import { OrderDto, OrderMetaData } from './types'
import { BUY_ETH_ADDRESS } from '@cowprotocol/contracts'

export function transformOrder(order: OrderDto): OrderMetaData {
  return transformEthFlowOrder(addTotalFeeToOrder(order))
}

/**
 * The executedSurplusFee represents exactly the fee that was charged (regardless of the fee signed with the order).
 * So, while the protocol currently does not allow placing a limit order with any other fee than 0 - the backend is designed to support these kinds of orders for the future.
 */
function addTotalFeeToOrder(dto: OrderDto): OrderMetaData {
  const { executedFeeAmount, executedSurplusFee } = dto
  const totalFee = executedSurplusFee ?? executedFeeAmount

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
function transformEthFlowOrder(order: OrderMetaData): OrderMetaData {
  const { ethflowData } = order

  if (!ethflowData) {
    return order
  }

  const { userValidTo: validTo } = ethflowData
  const owner = order.onchainOrderData?.user || order.owner
  const sellToken = BUY_ETH_ADDRESS

  return { ...order, validTo, owner, sellToken }
}
