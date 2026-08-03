import { setGlobalAdapter } from '@cowprotocol/sdk-common'

import {
  ComposableCowPollerAbi,
  type ComposableCowPollerSchedule,
  encodePollFunds,
  encodeRegister,
  encodeRegisterWithSignature,
  encodeRevoke,
  encodeRevokeWithSignature,
  getRegisterTypedData,
  getRevokeTypedData,
  getScheduleId,
} from '../src'
import { createAdapters } from './setup'

const SCHEDULE: ComposableCowPollerSchedule = {
  handler: '0x1111111111111111111111111111111111111111',
  funder: '0x2222222222222222222222222222222222222222',
  owner: '0x3333333333333333333333333333333333333333',
  salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
  staticInput: '0x1234',
}

const SCHEDULE_ID = '0x7b1516d117fa5dd96fddfb9489b52af1c3cca64e1bc88c32324bdd6a92c6057c'
const REGISTER_CALLDATA =
  '0x80313a250000000000000000000000000000000000000000000000000000000000000020000000000000000000000000111111111111111111111111111111111111111100000000000000000000000022222222222222222222222222222222222222220000000000000000000000003333333333333333333333333333333333333333000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000'
const POLL_FUNDS_CALLDATA = '0xf83740307b1516d117fa5dd96fddfb9489b52af1c3cca64e1bc88c32324bdd6a92c6057c'
const REVOKE_CALLDATA = '0xb75c7dc67b1516d117fa5dd96fddfb9489b52af1c3cca64e1bc88c32324bdd6a92c6057c'
const POLLER_ADDRESS = '0x4444444444444444444444444444444444444444'
const NONCE = 7
const DEADLINE = 2_000_000_000
const SIGNATURE = '0x123456'
const REGISTER_DIGEST = '0x19c2f3157fd433af46f24ac718b47fb3b8a9b456d2a2f2b6c31cc07820bec2d1'
const REVOKE_DIGEST = '0x904595cae3f7402646e3fba3b2683afaee0b71fd0eaf835ce0bb9c2bd7a3c9fd'

describe('ComposableCowPoller - Multi-Adapter Tests', () => {
  const adapters = createAdapters()

  test('derives the Solidity schedule ID across adapters', () => {
    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      expect(getScheduleId(SCHEDULE)).toEqual(SCHEDULE_ID)
    }
  })

  test('does not include staticInput in the schedule ID', () => {
    const updatedStaticInput = { ...SCHEDULE, staticInput: '0xdeadbeef' }

    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      expect(getScheduleId(updatedStaticInput)).toEqual(SCHEDULE_ID)
    }
  })

  test('encodes final poller calls across adapters', () => {
    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      expect(encodeRegister(SCHEDULE)).toEqual(REGISTER_CALLDATA)
      expect(encodePollFunds(SCHEDULE_ID)).toEqual(POLL_FUNDS_CALLDATA)
      expect(encodeRevoke(SCHEDULE_ID)).toEqual(REVOKE_CALLDATA)
    }
  })

  test('builds Solidity-compatible signature digests across adapters', () => {
    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      const registerTypedData = getRegisterTypedData({
        chainId: 1,
        pollerAddress: POLLER_ADDRESS,
        schedule: SCHEDULE,
        nonce: NONCE,
        deadline: DEADLINE,
      })
      const revokeTypedData = getRevokeTypedData({
        chainId: 1,
        pollerAddress: POLLER_ADDRESS,
        id: SCHEDULE_ID,
        funder: SCHEDULE.funder,
        nonce: NONCE,
        deadline: DEADLINE,
      })

      expect(
        adapter.utils.hashTypedData(registerTypedData.domain, registerTypedData.types, registerTypedData.message),
      ).toEqual(REGISTER_DIGEST)
      expect(
        adapter.utils.hashTypedData(revokeTypedData.domain, revokeTypedData.types, revokeTypedData.message),
      ).toEqual(REVOKE_DIGEST)
    }
  })

  test('encodes signature calls', () => {
    const adapter = adapters.viemAdapter
    setGlobalAdapter(adapter)

    const registerCall = adapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'registerWithSignature',
      encodeRegisterWithSignature(SCHEDULE, DEADLINE, SIGNATURE),
    )
    const revokeCall = adapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'revokeWithSignature',
      encodeRevokeWithSignature(SCHEDULE_ID, DEADLINE, SIGNATURE),
    )

    expect(Array.from(registerCall)).toEqual([SCHEDULE, BigInt(DEADLINE), SIGNATURE])
    expect(Array.from(revokeCall)).toEqual([SCHEDULE_ID, BigInt(DEADLINE), SIGNATURE])
  })

  test('exports the signature poller interface', () => {
    const functionNames = ComposableCowPollerAbi.filter((item) => item.type === 'function')
      .map((item) => item.name)

    expect(functionNames).toEqual(expect.arrayContaining(['nonces', 'registerWithSignature', 'revokeWithSignature']))
    expect(functionNames).not.toContain('topUp')
  })

  test('matches the final Poller ABI shape', () => {
    expect(ComposableCowPollerAbi.find((item) => item.type === 'function' && item.name === 'pollFunds')).toMatchObject(
      { outputs: [{ name: '', type: 'bool', internalType: 'bool' }] },
    )
    expect(ComposableCowPollerAbi.find((item) => item.type === 'event' && item.name === 'Pulled')).toMatchObject({
      inputs: expect.arrayContaining([expect.objectContaining({ name: 'orderDigest', type: 'bytes32', indexed: true })]),
    })
    expect(
      ComposableCowPollerAbi.find((item) => item.type === 'event' && item.name === 'ScheduleRegistered'),
    ).toMatchObject({
      inputs: expect.arrayContaining([expect.objectContaining({ name: 'paramsHash', type: 'bytes32', indexed: false })]),
    })
    expect(ComposableCowPollerAbi).toContainEqual({ type: 'error', name: 'AlreadyRegistered', inputs: [] })
  })
})
