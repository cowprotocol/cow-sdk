import { getGlobalAdapter } from '@cowprotocol/sdk-common'

import { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'
import { ComposableCowPollerSchedule, ComposableCowPollerScheduleKey } from './types'

export { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'

const SCHEDULE_ID_ABI = ['address', 'address', 'address', 'bytes32']

/**
 * Calculates the app-data-independent poller schedule ID.
 */
export function getScheduleId(schedule: ComposableCowPollerScheduleKey): string {
  const encoded = getGlobalAdapter().utils.encodeAbi(SCHEDULE_ID_ABI, [
    schedule.funder,
    schedule.handler,
    schedule.owner,
    schedule.salt,
  ])

  return getGlobalAdapter().utils.keccak256(encoded)
}

/**
 * Encodes a transaction that registers a JIT funding schedule.
 */
export function encodeRegister(schedule: ComposableCowPollerSchedule): string {
  return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'register', [schedule]) as string
}

/**
 * Encodes the app-data pre-hook that pulls funds for one active TWAP part.
 */
export function encodePollFunds(id: string): string {
  return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'pollFunds', [id]) as string
}

/**
 * Encodes a transaction that disables a JIT funding schedule.
 */
export function encodeRevoke(id: string): string {
  return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revoke', [id]) as string
}
