import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { BigNumber } from 'ethers-v5'

import * as composable from '../src'
import { ComposableCowPoller, type ComposableCowPollerDirectRevoke, type ComposableCowPollerSchedule } from '../src'
import { ComposableCowPollerAbi } from '../src/abis/ComposableCowPollerAbi'
import { createAdapters } from './setup'

const SCHEDULE: ComposableCowPollerSchedule = {
  handler: '0x1111111111111111111111111111111111111111',
  authEpoch: 0n,
  funder: '0x2222222222222222222222222222222222222222',
  owner: '0x3333333333333333333333333333333333333333',
  salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
  staticInput: '0x1234',
}

const SCHEDULE_ID = '0x7b1516d117fa5dd96fddfb9489b52af1c3cca64e1bc88c32324bdd6a92c6057c'
const POLL_FUNDS_CALLDATA = '0xf83740307b1516d117fa5dd96fddfb9489b52af1c3cca64e1bc88c32324bdd6a92c6057c'
const REGISTER_SELECTOR = '0x199d771f'
const REVOKE_SELECTOR = '0xd96054c4'

describe('ComposableCowPoller ABI', () => {
  test('keeps the ABI internal', () => {
    expect(composable).not.toHaveProperty('ComposableCowPollerAbi')
  })

  test('contains the SDK interface', () => {
    expect(ComposableCowPollerAbi.filter((item) => item.type === 'function').map((item) => item.name)).toEqual([
      'COMPOSABLE_COW',
      'pollFunds',
      'register',
      'revoke',
      'schedules',
    ])
  })

  test('matches the final observable shape', () => {
    expect(ComposableCowPollerAbi.find((item) => item.type === 'function' && item.name === 'pollFunds')).toMatchObject({
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    })
  })
})

describe('ComposableCowPoller', () => {
  const adapters = createAdapters()
  const pollerAddress = '0x4444444444444444444444444444444444444444'
  const composableCowAddress = '0x5555555555555555555555555555555555555555'
  const poller = new ComposableCowPoller(pollerAddress)

  test('retains the configured Poller address', () => {
    expect(poller.pollerAddress).toEqual(pollerAddress)
  })

  test('reads the ComposableCoW address on every call', async () => {
    const adapter = adapters.viemAdapter
    const instance = new ComposableCowPoller(pollerAddress)
    const readContract = jest
      .spyOn(adapter, 'readContract')
      .mockResolvedValueOnce(composableCowAddress)
      .mockResolvedValueOnce(pollerAddress)
    setGlobalAdapter(adapter)

    await expect(instance.getComposableCowAddress()).resolves.toEqual(composableCowAddress)
    await expect(instance.getComposableCowAddress()).resolves.toEqual(pollerAddress)
    expect(readContract).toHaveBeenCalledTimes(2)

    readContract.mockRestore()
  })

  test('normalizes schedule reads across adapters', async () => {
    const authEpoch = 7n
    const expected = { ...SCHEDULE, authEpoch }
    const cases = [
      { adapter: adapters.ethersV5Adapter, rawAuthEpoch: BigNumber.from(authEpoch) },
      { adapter: adapters.ethersV6Adapter, rawAuthEpoch: authEpoch },
      { adapter: adapters.viemAdapter, rawAuthEpoch: authEpoch },
    ]

    for (const { adapter, rawAuthEpoch } of cases) {
      const rawSchedule = Object.assign(
        [SCHEDULE.handler, rawAuthEpoch, SCHEDULE.funder, SCHEDULE.owner, SCHEDULE.salt, SCHEDULE.staticInput],
        {
          handler: SCHEDULE.handler,
          authEpoch: rawAuthEpoch,
          funder: SCHEDULE.funder,
          owner: SCHEDULE.owner,
          salt: SCHEDULE.salt,
          staticInput: SCHEDULE.staticInput,
        },
      )
      const readContract = jest.spyOn(adapter, 'readContract').mockResolvedValue(rawSchedule)
      setGlobalAdapter(adapter)

      const schedule = await poller.getSchedule(SCHEDULE_ID)

      expect(schedule).toEqual(expected)
      expect(Array.isArray(schedule)).toBe(false)
      readContract.mockRestore()
    }
  })

  test('derives the schedule ID across adapters', () => {
    const updatedSchedule = { ...SCHEDULE, authEpoch: 42n, staticInput: '0xdeadbeef' }

    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      expect(poller.getScheduleId(SCHEDULE)).toEqual(SCHEDULE_ID)
      expect(poller.getScheduleId(updatedSchedule)).toEqual(SCHEDULE_ID)
    }
  })

  test('encodes direct calls across adapters', () => {
    const directRevoke: ComposableCowPollerDirectRevoke = {
      handler: SCHEDULE.handler,
      owner: SCHEDULE.owner,
      salt: SCHEDULE.salt,
    }
    const registerCalls = []
    const revokeCalls = []

    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      registerCalls.push(poller.encodeRegister(SCHEDULE))
      expect(poller.encodePollFunds(SCHEDULE_ID)).toEqual(POLL_FUNDS_CALLDATA)
      revokeCalls.push(poller.encodeRevoke(directRevoke))
    }

    expect(new Set(registerCalls).size).toEqual(1)
    expect(new Set(revokeCalls).size).toEqual(1)
    expect(registerCalls[0]?.slice(0, 10)).toEqual(REGISTER_SELECTOR)
    expect(revokeCalls[0]?.slice(0, 10)).toEqual(REVOKE_SELECTOR)

    const [registeredSchedule] = adapters.viemAdapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'register',
      registerCalls[0]!,
    )
    expect(registeredSchedule).toEqual(SCHEDULE)

    const [handler, owner, salt] = adapters.viemAdapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'revoke',
      revokeCalls[0]!,
    )
    expect(handler.toLowerCase()).toEqual(SCHEDULE.handler)
    expect(owner.toLowerCase()).toEqual(SCHEDULE.owner)
    expect(salt).toEqual(SCHEDULE.salt)
  })
})
