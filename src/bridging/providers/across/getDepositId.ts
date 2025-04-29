import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { getAcrossDepositEvents, getCowTradeEvents } from './util'
import { SupportedChainId } from '../../../chains'

export async function getDepositId(
  chainId: SupportedChainId,
  orderId: string,
  txReceipt: TransactionReceipt,
): Promise<string | null> {
  const depositEvents = getAcrossDepositEvents(chainId, txReceipt.logs)

  if (depositEvents.length === 0) {
    return null
  }

  const cowTradeEvents = getCowTradeEvents(chainId, txReceipt.logs)

  // Find relative position for the orderId in the settlement tx
  const orderTradeIndex = cowTradeEvents.findIndex((event) => event.orderUid === orderId)

  if (orderTradeIndex < 0) return null

  // Get the depositId from the relative position
  return depositEvents[orderTradeIndex].depositId.toString()
}
