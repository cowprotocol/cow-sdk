import { BigIntish, getGlobalAdapter, Provider } from '@cowprotocol/sdk-common'

import { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'
import type {
  ComposableCowPollerDirectRevoke,
  ComposableCowPollerRegisterTypedDataParams,
  ComposableCowPollerRevokeTypedDataParams,
  ComposableCowPollerSchedule,
  ComposableCowPollerScheduleAuthorization,
  ComposableCowPollerScheduleKey,
  ComposableCowPollerTypedData,
} from './types'

const SCHEDULE_ID_ABI = ['address', 'address', 'address', 'bytes32']
const REGISTER_TYPES = {
  ScheduleRegistration: [
    { name: 'handler', type: 'address' },
    { name: 'authEpoch', type: 'uint96' },
    { name: 'funder', type: 'address' },
    { name: 'owner', type: 'address' },
    { name: 'salt', type: 'bytes32' },
    { name: 'staticInput', type: 'bytes' },
    { name: 'deadline', type: 'uint256' },
  ],
}
const REVOKE_TYPES = {
  Revoke: [
    { name: 'handler', type: 'address' },
    { name: 'authEpoch', type: 'uint96' },
    { name: 'funder', type: 'address' },
    { name: 'owner', type: 'address' },
    { name: 'salt', type: 'bytes32' },
    { name: 'deadline', type: 'uint256' },
  ],
}

type RegisterMessage = {
  readonly handler: string
  readonly authEpoch: BigIntish
  readonly funder: string
  readonly owner: string
  readonly salt: string
  readonly staticInput: string
  readonly deadline: BigIntish
}

type RevokeMessage = {
  readonly handler: string
  readonly authEpoch: BigIntish
  readonly funder: string
  readonly owner: string
  readonly salt: string
  readonly deadline: BigIntish
}

/** Utilities for interacting with a ComposableCowPoller deployment. */
export class ComposableCowPoller {
  private composableCowAddress?: { adapter: ReturnType<typeof getGlobalAdapter>; address: string }
  private cowShedFactoryAddress?: { adapter: ReturnType<typeof getGlobalAdapter>; address: string }

  constructor(public readonly pollerAddress?: string) {}

  private getPollerAddress(): string {
    if (!this.pollerAddress) throw new Error('pollerAddress is required')

    return this.pollerAddress
  }

  private read(functionName: string, args: unknown[] = [], provider?: Provider): Promise<unknown> {
    return getGlobalAdapter().readContract(
      { address: this.getPollerAddress(), abi: ComposableCowPollerAbi, functionName, args },
      provider,
    )
  }

  public async getComposableCowAddress(provider?: Provider): Promise<string> {
    const adapter = getGlobalAdapter()
    if (!provider && this.composableCowAddress?.adapter === adapter) return this.composableCowAddress.address

    const address = (await this.read('COMPOSABLE_COW', [], provider)) as string
    if (!provider) this.composableCowAddress = { adapter, address }
    return address
  }

  public async getCowShedFactoryAddress(provider?: Provider): Promise<string> {
    const adapter = getGlobalAdapter()
    if (!provider && this.cowShedFactoryAddress?.adapter === adapter) return this.cowShedFactoryAddress.address

    const address = (await this.read('COW_SHED_FACTORY', [], provider)) as string
    if (!provider) this.cowShedFactoryAddress = { adapter, address }
    return address
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

  public getEip712Domain(chainId: number) {
    return {
      name: 'ComposableCowPoller',
      version: '1',
      chainId,
      verifyingContract: this.getPollerAddress(),
    }
  }

  /** Builds the EIP-712 payload authorized by registerWithSignature. */
  public getRegisterTypedData({
    chainId,
    schedule,
    deadline,
  }: ComposableCowPollerRegisterTypedDataParams): ComposableCowPollerTypedData<
    'ScheduleRegistration',
    RegisterMessage
  > {
    return {
      domain: this.getEip712Domain(chainId),
      types: REGISTER_TYPES,
      primaryType: 'ScheduleRegistration',
      message: {
        handler: schedule.handler,
        authEpoch: schedule.authEpoch,
        funder: schedule.funder,
        owner: schedule.owner,
        salt: schedule.salt,
        staticInput: schedule.staticInput,
        deadline,
      },
    }
  }

  /** Builds the EIP-712 payload authorized by revokeWithSignature. */
  public getRevokeTypedData({
    chainId,
    handler,
    authEpoch,
    funder,
    owner,
    salt,
    deadline,
  }: ComposableCowPollerRevokeTypedDataParams): ComposableCowPollerTypedData<'Revoke', RevokeMessage> {
    return {
      domain: this.getEip712Domain(chainId),
      types: REVOKE_TYPES,
      primaryType: 'Revoke',
      message: { handler, authEpoch, funder, owner, salt, deadline },
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

  /** Encodes Poller.registerFromShed for execution by the funder's CowShed. */
  public encodeRegisterFromShed(schedule: ComposableCowPollerSchedule): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'registerFromShed', [schedule]) as string
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
  public encodeRevoke({ handler, owner, salt }: ComposableCowPollerDirectRevoke): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revoke', [handler, owner, salt]) as string
  }

  /** Encodes Poller.revokeFromShed for execution by the funder's CowShed. */
  public encodeRevokeFromShed({
    handler,
    funder,
    owner,
    salt,
    authEpoch,
  }: ComposableCowPollerScheduleAuthorization): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revokeFromShed', [
      handler,
      funder,
      owner,
      salt,
      authEpoch,
    ]) as string
  }

  /** Encodes Poller.revokeWithSignature. */
  public encodeRevokeWithSignature(
    { handler, funder, owner, salt, authEpoch }: ComposableCowPollerScheduleAuthorization,
    deadline: BigIntish,
    signature: string,
  ): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revokeWithSignature', [
      handler,
      funder,
      owner,
      salt,
      authEpoch,
      deadline,
      signature,
    ]) as string
  }
}
