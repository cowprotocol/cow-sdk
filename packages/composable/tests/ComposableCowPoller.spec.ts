import { setGlobalAdapter } from '@cowprotocol/sdk-common'

import * as composable from '../src'
import { ComposableCowPoller, type ComposableCowPollerSchedule } from '../src'
import { ComposableCowPollerAbi } from '../src/abis/ComposableCowPollerAbi'
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
const DEADLINE = 1_800_000_000n
const SIGNATURE = '0x123456'

describe('ComposableCowPoller ABI', () => {
  test('keeps the ABI internal', () => {
    expect(composable).not.toHaveProperty('ComposableCowPollerAbi')
  })

  test('contains the SDK interface', () => {
    expect(ComposableCowPollerAbi.filter((item) => item.type === 'function').map((item) => item.name)).toEqual([
      'COMPOSABLE_COW',
      'nonces',
      'pollFunds',
      'register',
      'registerWithSignature',
      'revoke',
      'revokeWithSignature',
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

  test('memoizes the ComposableCoW address for the default provider', async () => {
    const adapter = adapters.viemAdapter
    const instance = new ComposableCowPoller(pollerAddress)
    const readContract = jest.spyOn(adapter, 'readContract').mockResolvedValue(composableCowAddress)
    setGlobalAdapter(adapter)

    await expect(instance.getComposableCowAddress()).resolves.toEqual(composableCowAddress)
    await expect(instance.getComposableCowAddress()).resolves.toEqual(composableCowAddress)
    expect(readContract).toHaveBeenCalledTimes(1)

    readContract.mockRestore()
  })

  test('does not memoize ComposableCoW reads for an explicit provider', async () => {
    const adapter = adapters.viemAdapter
    const instance = new ComposableCowPoller(pollerAddress)
    const provider = {} as Parameters<typeof instance.getComposableCowAddress>[0]
    const readContract = jest.spyOn(adapter, 'readContract').mockResolvedValue(composableCowAddress)
    setGlobalAdapter(adapter)

    await instance.getComposableCowAddress(provider)
    await instance.getComposableCowAddress(provider)
    expect(readContract).toHaveBeenCalledTimes(2)

    readContract.mockRestore()
  })

  test('does not reuse a memoized ComposableCoW address after changing adapters', async () => {
    const instance = new ComposableCowPoller(pollerAddress)
    const viemRead = jest.spyOn(adapters.viemAdapter, 'readContract').mockResolvedValue(composableCowAddress)
    const ethersRead = jest.spyOn(adapters.ethersV6Adapter, 'readContract').mockResolvedValue(pollerAddress)

    setGlobalAdapter(adapters.viemAdapter)
    await expect(instance.getComposableCowAddress()).resolves.toEqual(composableCowAddress)
    setGlobalAdapter(adapters.ethersV6Adapter)
    await expect(instance.getComposableCowAddress()).resolves.toEqual(pollerAddress)
    expect(viemRead).toHaveBeenCalledTimes(1)
    expect(ethersRead).toHaveBeenCalledTimes(1)

    viemRead.mockRestore()
    ethersRead.mockRestore()
  })

  test('derives the schedule ID across adapters', () => {
    const updatedSchedule = { ...SCHEDULE, staticInput: '0xdeadbeef' }

    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      expect(poller.getScheduleId(SCHEDULE)).toEqual(SCHEDULE_ID)
      expect(poller.getScheduleId(updatedSchedule)).toEqual(SCHEDULE_ID)
    }
  })

  test('encodes direct calls across adapters', () => {
    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      expect(poller.encodeRegister(SCHEDULE)).toEqual(REGISTER_CALLDATA)
      expect(poller.encodePollFunds(SCHEDULE_ID)).toEqual(POLL_FUNDS_CALLDATA)
      expect(poller.encodeRevoke(SCHEDULE_ID)).toEqual(REVOKE_CALLDATA)
    }
  })

  test('encodes signed registration calldata across adapters', () => {
    const encodedCalls = []

    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      encodedCalls.push(poller.encodeRegisterWithSignature(SCHEDULE, DEADLINE, SIGNATURE))
    }

    expect(new Set(encodedCalls).size).toEqual(1)

    const [schedule, deadline, signature] = adapters.viemAdapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'registerWithSignature',
      encodedCalls[0]!,
    )

    expect(schedule.handler.toLowerCase()).toEqual(SCHEDULE.handler)
    expect(schedule.funder.toLowerCase()).toEqual(SCHEDULE.funder)
    expect(schedule.owner.toLowerCase()).toEqual(SCHEDULE.owner)
    expect(schedule.salt).toEqual(SCHEDULE.salt)
    expect(schedule.staticInput).toEqual(SCHEDULE.staticInput)
    expect(adapters.viemAdapter.utils.toBigIntish(deadline)).toEqual(DEADLINE)
    expect(signature).toEqual(SIGNATURE)
  })
})
