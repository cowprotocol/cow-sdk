import { getAcrossDepositEvents } from './util'
import { BridgingDepositParams } from '../../types'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { log, TransactionReceipt } from '@cowprotocol/sdk-common'
import { EnrichedOrder } from '@cowprotocol/sdk-order-book'

export async function getDepositParams(
  chainId: SupportedChainId,
  order: EnrichedOrder,
  txReceipt: TransactionReceipt,
): Promise<BridgingDepositParams | null> {
  const depositEvents = getAcrossDepositEvents(chainId, txReceipt.logs)

  if (depositEvents.length === 0 || !order.fullAppData) {
    return null
  }

  const appDataObj = JSON.parse(order.fullAppData)
  const bridgeQuoteId = (appDataObj as cowAppDataLatestScheme.AppDataRootSchema)?.metadata?.bridging?.quoteId

  if (!bridgeQuoteId) return null

  const depositEvent = depositEvents.find((i) => {
    return i.message.toLowerCase() === bridgeQuoteId.toLowerCase()
  })

  if (!depositEvent) {
    log(
      `Trade event found for bridge with quoteId=${bridgeQuoteId} but only ${depositEvents.length} deposit events available`,
    )
    return null
  }

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
