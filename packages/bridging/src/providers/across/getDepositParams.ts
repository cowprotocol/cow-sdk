import { EnrichedOrder } from '@cowprotocol/sdk-order-book'
import { log, TransactionReceipt, getGlobalAdapter, isWrappedNativeToken } from '@cowprotocol/sdk-common'
import { getChainInfo, SupportedChainId } from '@cowprotocol/sdk-config'
import { cowAppDataLatestScheme } from '@cowprotocol/sdk-app-data'

import { getAcrossDepositEvents } from './util'
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
    const rawMessage = i.message
    if (typeof rawMessage !== 'string' || rawMessage.length < 2) {
      return false
    }
    let decoded: string | undefined
    try {
      const tuple = adapter.utils.decodeAbi(['string'], rawMessage) as [string]
      decoded = tuple[0]
    } catch {
      return false
    }
    return decoded === bridgeQuoteId
  })

  if (!depositEvent) {
    log(
      `Trade event found for bridge with quoteId=${bridgeQuoteId} but only ${depositEvents.length} deposit events available`,
    )
    return null
  }

  const outputTokenAddress = depositEvent.outputToken
  const destinationChainId = parseInt(depositEvent.destinationChainId.toString())
  const destinationNativeToken = getChainInfo(destinationChainId)?.nativeCurrency

  return {
    inputTokenAddress: depositEvent.inputToken,
    // Across uses wrapped native token address for both native and wrapped tokens
    outputTokenAddress: isWrappedNativeToken({
      address: outputTokenAddress,
      chainId: destinationChainId,
    })
      ? (destinationNativeToken?.address ?? outputTokenAddress)
      : outputTokenAddress,
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
