import { getGlobalAdapter } from '@cowprotocol/sdk-common'

import { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'
import type { ComposableCowPollerSchedule, ComposableCowPollerScheduleKey } from './types'

const SCHEDULE_ID_ABI = ['address', 'address', 'address', 'bytes32']

/** Utilities for interacting with a ComposableCowPoller deployment. */
export class ComposableCowPoller {
  constructor(public readonly pollerAddress?: string) {}

  /** Returns the app-data-independent schedule ID. */
  public scheduleId(schedule: ComposableCowPollerScheduleKey): string {
    const encoded = getGlobalAdapter().utils.encodeAbi(SCHEDULE_ID_ABI, [
      schedule.funder,
      schedule.handler,
      schedule.owner,
      schedule.salt,
    ])

    return getGlobalAdapter().utils.keccak256(encoded)
  }

  /** Encodes Poller.register. */
  public register(schedule: ComposableCowPollerSchedule): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'register', [schedule]) as string
  }

  /** Encodes Poller.pollFunds. */
  public pollFunds(id: string): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'pollFunds', [id]) as string
  }

  /** Encodes Poller.revoke. */
  public revoke(id: string): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revoke', [id]) as string
  }
}
