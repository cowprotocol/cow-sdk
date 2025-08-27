import { BridgeStatus, BridgeStatusResult } from '../../types'
import { AcrossStatus, BungeeBridgeName, BungeeEvent, BungeeEventStatus } from './types'

export async function getBridgingStatusFromEvents(
  events: BungeeEvent[] | undefined,
  getAcrossStatus: (depositTxHash: string) => Promise<AcrossStatus>,
): Promise<BridgeStatusResult> {
  // if empty, return not_initiated
  // order id exists so order is valid, but
  // - bungee may not have indexed the event yet, which it will do eventually
  // - or the order is not filled yet on cowswap
  if (!events?.length) {
    return { status: BridgeStatus.UNKNOWN }
  }
  const event = events[0]

  // if srcTxStatus = pending, return in_progress
  if (event.srcTxStatus === BungeeEventStatus.PENDING) {
    return { status: BridgeStatus.IN_PROGRESS }
  }

  console.log('SDK getBridgingStatusFromEvents event ==>', event)
  // if srcTxStatus = completed & destTxStatus = pending,
  if (event.srcTxStatus === BungeeEventStatus.COMPLETED && event.destTxStatus === BungeeEventStatus.PENDING) {
    console.log('SDK getBridgingStatusFromEvents event.COMPLETED ==>', event.bridgeName)

    // if bridgeName = across,
    if (event.bridgeName === BungeeBridgeName.ACROSS) {
      try {
        // check across api to check status is expired or refunded
        const acrossStatus = await getAcrossStatus(event.orderId)
        if (acrossStatus === 'expired') {
          return { status: BridgeStatus.EXPIRED, depositTxHash: event.srcTransactionHash }
        }
        if (acrossStatus === 'refunded') {
          // refunded means failed
          return { status: BridgeStatus.REFUND, depositTxHash: event.srcTransactionHash }
        }
      } catch (e) {
        console.error('BungeeBridgeProvider get across status error', e)
      }
    }

    console.log('SDK getBridgingStatusFromEvents is not across ==>', event.bridgeName)
    // if not across or across API fails, waiting for dest tx, return in_progress
    return { status: BridgeStatus.IN_PROGRESS, depositTxHash: event.srcTransactionHash }
  }

  // if srcTxStatus = completed & destTxStatus = completed, return executed
  if (event.srcTxStatus === BungeeEventStatus.COMPLETED && event.destTxStatus === BungeeEventStatus.COMPLETED) {
    console.log('SDK getBridgingStatusFromEvents is completed ==>', event.bridgeName)

    return {
      status: BridgeStatus.EXECUTED,
      depositTxHash: event.srcTransactionHash,
      fillTxHash: event.destTransactionHash,
    }
  }

  // there is no failed case for across - gets auto-refunded - or cctp - attestation can be relayed by anyone on destination chain
  throw new Error('Unknown status')
}
