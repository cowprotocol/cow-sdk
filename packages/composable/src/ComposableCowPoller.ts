import { BigIntish, getGlobalAdapter } from '@cowprotocol/sdk-common'

import { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'
import {
  ComposableCowPollerRegisterTypedDataParams,
  ComposableCowPollerRevokeTypedDataParams,
  ComposableCowPollerSchedule,
  ComposableCowPollerScheduleKey,
  ComposableCowPollerTypedData,
} from './types'

export { ComposableCowPollerAbi } from './abis/ComposableCowPollerAbi'

const SCHEDULE_ID_ABI = ['address', 'address', 'address', 'bytes32']
const POLLER_DOMAIN_NAME = 'ComposableCowPoller'
const POLLER_DOMAIN_VERSION = '1'
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

function getPollerDomain(chainId: number, pollerAddress: string) {
  return {
    name: POLLER_DOMAIN_NAME,
    version: POLLER_DOMAIN_VERSION,
    chainId,
    verifyingContract: pollerAddress,
  }
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

/** Builds the exact EIP-712 payload authorized by registerWithSignature. */
export function getRegisterTypedData({
  chainId,
  pollerAddress,
  schedule,
  nonce,
  deadline,
}: ComposableCowPollerRegisterTypedDataParams): ComposableCowPollerTypedData<'Register', RegisterMessage> {
  return {
    domain: getPollerDomain(chainId, pollerAddress),
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

/** Builds the exact EIP-712 payload authorized by revokeWithSignature. */
export function getRevokeTypedData({
  chainId,
  pollerAddress,
  id,
  funder,
  nonce,
  deadline,
}: ComposableCowPollerRevokeTypedDataParams): ComposableCowPollerTypedData<'Revoke', RevokeMessage> {
  return {
    domain: getPollerDomain(chainId, pollerAddress),
    types: REVOKE_TYPES,
    primaryType: 'Revoke',
    message: { id, funder, nonce, deadline },
  }
}

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

/** Encodes a relayed registration authorized by the funder's signature. */
export function encodeRegisterWithSignature(
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

/** Encodes a relayed revocation authorized by the funder's signature. */
export function encodeRevokeWithSignature(id: string, deadline: BigIntish, signature: string): string {
  return getGlobalAdapter().utils.encodeFunction(ComposableCowPollerAbi, 'revokeWithSignature', [
    id,
    deadline,
    signature,
  ]) as string
}
