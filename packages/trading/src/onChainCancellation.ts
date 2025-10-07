import { EthFlowContract, GenericContract, SettlementContract } from '@cowprotocol/sdk-common'
import { EnrichedOrder } from '@cowprotocol/sdk-order-book'
import { TradingTransactionParams as TransactionParams } from './types'

// Fallback If we couldn't estimate gas for on-chain cancellation

const CANCELLATION_GAS_LIMIT_DEFAULT = 150_000n

interface OrderCancellationContract<T> extends GenericContract {
  invalidateOrder(payload: T): Promise<any>
}

interface OnChainCancellation {
  estimatedGas: bigint
  transaction: TransactionParams
}

export async function getEthFlowCancellation(
  ethFlowContract: EthFlowContract,
  order: EnrichedOrder,
): Promise<OnChainCancellation> {
  const cancelOrderParams = {
    buyToken: order.buyToken,
    receiver: order.receiver || order.owner,
    sellAmount: order.sellAmount,
    buyAmount: order.buyAmount,
    appData: order.appData.toString(),
    feeAmount: order.feeAmount,
    validTo: order.validTo.toString(),
    partiallyFillable: false,
    quoteId: 0, // value doesn't matter, set to 0 for reducing gas costs
  }

  return getOnChainCancellation(ethFlowContract, cancelOrderParams)
}

export async function getSettlementCancellation(
  settlementContract: SettlementContract,
  order: EnrichedOrder,
): Promise<OnChainCancellation> {
  const cancelOrderParams = order.uid

  return getOnChainCancellation(settlementContract, cancelOrderParams)
}

async function getOnChainCancellation<T>(
  contract: OrderCancellationContract<T>,
  cancelOrderParams: T,
): Promise<OnChainCancellation> {
  const estimatedGas = await (async () => {
    try {
      if (contract.estimateGas.invalidateOrder) {
        const estimated = await contract.estimateGas.invalidateOrder(cancelOrderParams)

        return BigInt(estimated.toHexString ? estimated.toHexString() : `0x${estimated.toString(16)}`)
      }
      return CANCELLATION_GAS_LIMIT_DEFAULT
    } catch (error) {
      console.error(error)

      return CANCELLATION_GAS_LIMIT_DEFAULT
    }
  })()

  const data = contract.interface.encodeFunctionData('invalidateOrder', [cancelOrderParams])

  return {
    estimatedGas,
    transaction: {
      data,
      gasLimit: '0x' + estimatedGas.toString(16),
      to: contract.address,
      value: '0x0',
    },
  }
}
