import { BigIntish, getGlobalAdapter, Provider } from '@cowprotocol/sdk-common'

import { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'
import type {
  ComposableCowPollerRegisterTypedDataParams,
  ComposableCowPollerRevokeTypedDataParams,
  ComposableCowPollerSchedule,
  ComposableCowPollerScheduleKey,
  ComposableCowPollerTypedData,
} from './types'

const SCHEDULE_ID_ABI = ['address', 'address', 'address', 'bytes32']
const REGISTER_TYPES = {
  Register: [
    { name: 'handler', type: 'address' },
    { name: 'funder', type: 'address' },
    { name: 'owner', type: 'address' },
    { name: 'salt', type: 'bytes32' },
    { name: 'staticInputHash', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
}
const REVOKE_TYPES = {
  Revoke: [
    { name: 'id', type: 'bytes32' },
    { name: 'funder', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
}

type RegisterMessage = {
  readonly handler: string
  readonly funder: string
  readonly owner: string
  readonly salt: string
  readonly staticInputHash: string
  readonly nonce: BigIntish
  readonly deadline: BigIntish
}

type RevokeMessage = {
  readonly id: string
  readonly funder: string
  readonly nonce: BigIntish
  readonly deadline: BigIntish
}

/** Utilities for interacting with a ComposableCowPoller deployment. */
export class ComposableCowPoller {
  private composableCowAddress?: { adapter: ReturnType<typeof getGlobalAdapter>; address: string }

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

  public async getNonce(funder: string, provider?: Provider): Promise<BigIntish> {
    return getGlobalAdapter().utils.toBigIntish((await this.read('nonces', [funder], provider)) as BigIntish)
  }

  public async getSchedule(id: string, provider?: Provider): Promise<ComposableCowPollerSchedule> {
    return (await this.read('schedules', [id], provider)) as ComposableCowPollerSchedule
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
    nonce,
    deadline,
  }: ComposableCowPollerRegisterTypedDataParams): ComposableCowPollerTypedData<'Register', RegisterMessage> {
    return {
      domain: this.getEip712Domain(chainId),
      types: REGISTER_TYPES,
      primaryType: 'Register',
      message: {
        handler: schedule.handler,
        funder: schedule.funder,
        owner: schedule.owner,
        salt: schedule.salt,
        staticInputHash: getGlobalAdapter().utils.keccak256(schedule.staticInput),
        nonce,
        deadline,
      },
    }
  }

  /** Builds the EIP-712 payload authorized by revokeWithSignature. */
  public getRevokeTypedData({
    chainId,
    id,
    funder,
    nonce,
    deadline,
  }: ComposableCowPollerRevokeTypedDataParams): ComposableCowPollerTypedData<'Revoke', RevokeMessage> {
    return {
      domain: this.getEip712Domain(chainId),
      types: REVOKE_TYPES,
      primaryType: 'Revoke',
      message: { id, funder, nonce, deadline },
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

  /** Encodes Poller.revokeWithSignature. */
  public encodeRevokeWithSignature(id: string, deadline: BigIntish, signature: string): string {
    return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revokeWithSignature', [
      id,
      deadline,
      signature,
    ]) as string
  }
}
