import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { getAcrossDepositEvents, getCowTradeEvents } from './util'
import { SupportedChainId } from '../../../chains'
import { BridgingDepositParams } from '../../types'

export async function getDepositParams(
  chainId: SupportedChainId,
  orderId: string,
  txReceipt: TransactionReceipt,
): Promise<BridgingDepositParams | null> {
  const depositEvents = getAcrossDepositEvents(chainId, txReceipt.logs)

  if (depositEvents.length === 0) {
    return null
  }

  const cowTradeEvents = getCowTradeEvents(chainId, txReceipt.logs)

  // Find relative position for the orderId in the settlement tx
  const orderTradeIndex = cowTradeEvents.findIndex((event) => event.orderUid === orderId)

  if (orderTradeIndex < 0) return null

  const depositEvent = depositEvents[orderTradeIndex]

  return {
    inputTokenAddress: depositEvent.inputToken,
    outputTokenAddress: depositEvent.outputToken,
    inputAmount: BigInt(depositEvent.inputAmount.toString()),
    outputAmount: BigInt(depositEvent.outputAmount.toString()),
    owner: depositEvent.depositor,
    quoteTimestamp: parseInt(depositEvent.quoteTimestamp.toString()),
    fillDeadline: parseInt(depositEvent.fillDeadline.toString()),
    recipient: depositEvent.recipient,
    sourceChainId: chainId,
    destinationChainId: parseInt(depositEvent.destinationChainId.toString()),
    bridgingId: depositEvent.depositId.toString(),
  }
}
