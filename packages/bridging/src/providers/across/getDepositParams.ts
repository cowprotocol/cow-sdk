import { EnrichedOrder } from '@cowprotocol/sdk-order-book'
import { log, TransactionReceipt, getGlobalAdapter } from '@cowprotocol/sdk-common'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { cowAppDataLatestScheme } from '@cowprotocol/sdk-app-data'

import { getAcrossDepositEvents, mapNativeOrWrappedTokenAddress } from './util'
import { BridgingDepositParams } from '../../types'

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

  const adapter = getGlobalAdapter()

  const depositEvent = depositEvents.find((i) => {
    // The quoteId is encoded into the deposit call in createAcrossDepositCall()
    const message = adapter.utils.decodeAbi(['string'], i.message)

    return message[0] === bridgeQuoteId
  })

  if (!depositEvent) {
    log(
      `Trade event found for bridge with quoteId=${bridgeQuoteId} but only ${depositEvents.length} deposit events available`,
    )
    return null
  }

  const destinationChainId = parseInt(depositEvent.destinationChainId.toString())

  return {
    inputTokenAddress: depositEvent.inputToken,
    outputTokenAddress: mapNativeOrWrappedTokenAddress({
      address: depositEvent.outputToken,
      chainId: destinationChainId,
    }),
    inputAmount: BigInt(depositEvent.inputAmount.toString()),
    outputAmount: BigInt(depositEvent.outputAmount.toString()),
    owner: depositEvent.depositor,
    quoteTimestamp: parseInt(depositEvent.quoteTimestamp.toString()),
    fillDeadline: parseInt(depositEvent.fillDeadline.toString()),
    recipient: depositEvent.recipient,
    sourceChainId: chainId,
    destinationChainId,
    bridgingId: depositEvent.depositId.toString(),
  }
}
