import { getGlobalAdapter } from '@cowprotocol/sdk-common'

import { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'
import type { ComposableCowPollerSchedule, ComposableCowPollerScheduleKey } from './types'

const SCHEDULE_ID_ABI = ['address', 'address', 'address', 'bytes32']

/** Returns the app-data-independent schedule ID. */
export function getScheduleId(schedule: ComposableCowPollerScheduleKey): string {
  const encoded = getGlobalAdapter().utils.encodeAbi(SCHEDULE_ID_ABI, [
    schedule.funder,
    schedule.handler,
    schedule.owner,
    schedule.salt,
  ])

  return getGlobalAdapter().utils.keccak256(encoded)
}

/** Encodes Poller.register. */
export function encodeRegister(schedule: ComposableCowPollerSchedule): string {
  return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'register', [schedule]) as string
}

/** Encodes Poller.pollFunds. */
export function encodePollFunds(id: string): string {
  return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'pollFunds', [id]) as string
}

/** Encodes Poller.revoke. */
export function encodeRevoke(id: string): string {
  return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revoke', [id]) as string
}
