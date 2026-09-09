import { BigIntish, getGlobalAdapter, Provider } from '@cowprotocol/sdk-common'

import { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'
import type {
  ComposableCowPollerDirectRevoke,
  ComposableCowPollerSchedule,
  ComposableCowPollerScheduleKey,
} from './types'

const SCHEDULE_ID_ABI = ['address', 'address', 'address', 'bytes32']

/** Utilities for interacting with a ComposableCowPoller deployment. */
export class ComposableCowPoller {
  constructor(public readonly pollerAddress?: string) {}

  private read(functionName: string, args: unknown[] = [], provider?: Provider): Promise<unknown> {
    if (!this.pollerAddress) throw new Error('pollerAddress is required')

    return getGlobalAdapter().readContract(
      { address: this.pollerAddress, abi: ComposableCowPollerAbi, functionName, args },
      provider,
    )
  }

  public async getComposableCowAddress(provider?: Provider): Promise<string> {
    return (await this.read('COMPOSABLE_COW', [], provider)) as string
  }

  public async getSchedule(id: string, provider?: Provider): Promise<ComposableCowPollerSchedule> {
    const adapter = getGlobalAdapter()
    const [handler, authEpoch, funder, owner, salt, staticInput] = (await this.read('schedules', [id], provider)) as [
      string,
      BigIntish,
      string,
      string,
      string,
      string,
    ]

    return {
      handler,
      authEpoch: adapter.utils.toBigIntish(authEpoch),
      funder,
      owner,
      salt,
      staticInput,
    }
  }

  /** Returns the app-data-independent schedule ID. */
  public getScheduleId(schedule: ComposableCowPollerScheduleKey): string {
    const encoded = getGlobalAdapter().utils.encodeAbi(SCHEDULE_ID_ABI, [
      schedule.funder,
      schedule.handler,
      schedule.owner,
      schedule.salt,
    ])

    return getGlobalAdapter().utils.keccak256(encoded)
  }

  /** Encodes Poller.register. */
  public encodeRegister(schedule: ComposableCowPollerSchedule): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'register', [schedule]) as string
  }

  /** Encodes Poller.pollFunds. */
  public encodePollFunds(id: string): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'pollFunds', [id]) as string
  }

  /** Encodes Poller.revoke. */
  public encodeRevoke({ handler, owner, salt }: ComposableCowPollerDirectRevoke): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revoke', [handler, owner, salt]) as string
  }
}
