import { BigIntish, getGlobalAdapter, Provider } from '@cowprotocol/sdk-common'

import { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'
import type { ComposableCowPollerSchedule, ComposableCowPollerScheduleKey } from './types'

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

  public async getNonce(funder: string, provider?: Provider): Promise<BigIntish> {
    return getGlobalAdapter().utils.toBigIntish((await this.read('nonces', [funder], provider)) as BigIntish)
  }

  public async getSchedule(id: string, provider?: Provider): Promise<ComposableCowPollerSchedule> {
    return (await this.read('schedules', [id], provider)) as ComposableCowPollerSchedule
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

  /** Encodes Poller.registerWithSignature. */
  public encodeRegisterWithSignature(
    schedule: ComposableCowPollerSchedule,
    deadline: BigIntish,
    signature: string,
  ): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'registerWithSignature', [
      schedule,
      deadline,
      signature,
    ]) as string
  }

  /** Encodes Poller.pollFunds. */
  public encodePollFunds(id: string): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'pollFunds', [id]) as string
  }

  /** Encodes Poller.revoke. */
  public encodeRevoke(id: string): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revoke', [id]) as string
  }
}
