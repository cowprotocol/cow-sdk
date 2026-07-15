import { setGlobalAdapter } from '@cowprotocol/sdk-common'

import {
  ComposableCowPollerAbi,
  encodePollFunds,
  encodeRegister,
  encodeRevoke,
  getScheduleId,
} from '../src/ComposableCowPoller'
import { ComposableCowPollerSchedule } from '../src/types'
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

  test('exports the combined poller interface, not the removed topUp method', () => {
    const functionNames = ComposableCowPollerAbi.filter((item) => item.type === 'function')
      .map((item) => item.name)
      .sort()
    const errorNames = ComposableCowPollerAbi.filter((item) => item.type === 'error')
      .map((item) => item.name)
      .sort()
    const eventNames = ComposableCowPollerAbi.filter((item) => item.type === 'event')
      .map((item) => item.name)
      .sort()
    const constructor = ComposableCowPollerAbi.find((item) => item.type === 'constructor')

    expect(functionNames).toEqual([
      'composableCow',
      'lastFunded',
      'pollFunds',
      'register',
      'revoke',
      'scheduleId',
      'schedules',
    ])
    expect(errorNames).toEqual(['NoSchedule', 'OnlyFunder', 'OrderNotLive'])
    expect(eventNames).toEqual(['Pulled', 'ScheduleRegistered', 'ScheduleRevoked'])
    expect(constructor).toEqual({
      inputs: [{ internalType: 'contract ComposableCoW', name: '_composableCow', type: 'address' }],
      stateMutability: 'nonpayable',
      type: 'constructor',
    })
  })
})
