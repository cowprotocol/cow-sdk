import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { BigNumber } from 'ethers-v5'

import * as composable from '../src'
import {
  ComposableCowPoller,
  type ComposableCowPollerDirectRevoke,
  type ComposableCowPollerSchedule,
  type ComposableCowPollerScheduleAuthorization,
} from '../src'
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
const POLLER_ADDRESS = '0x4444444444444444444444444444444444444444'
const CHAIN_ID = 1
const DEADLINE = 2_000_000_000n
const SIGNATURE = '0x123456'
const REGISTER_DIGEST = '0x7abf30523ae51092914ae8230bc2af45078d9b4f47062f3c9cb6e39cd13106bf'
const REVOKE_DIGEST = '0x11b6cb77364f3c3f8a454cb36f0d22166c6acd9575c066b309f95c9aff712c5f'
const AUTHORIZATION: ComposableCowPollerScheduleAuthorization = {
  handler: SCHEDULE.handler,
  authEpoch: SCHEDULE.authEpoch,
  funder: SCHEDULE.funder,
  owner: SCHEDULE.owner,
  salt: SCHEDULE.salt,
}

describe('ComposableCowPoller ABI', () => {
  test('keeps the ABI internal', () => {
    expect(composable).not.toHaveProperty('ComposableCowPollerAbi')
  })

  test('contains the SDK interface', () => {
    expect(ComposableCowPollerAbi.filter((item) => item.type === 'function').map((item) => item.name)).toEqual([
      'COMPOSABLE_COW',
      'COW_SHED_FACTORY',
      'pollFunds',
      'register',
      'registerFromShed',
      'registerWithSignature',
      'revoke',
      'revokeFromShed',
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
  const pollerAddress = POLLER_ADDRESS
  const composableCowAddress = '0x5555555555555555555555555555555555555555'
  const cowShedFactoryAddress = '0x6666666666666666666666666666666666666666'
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

  test('memoizes the CowShed factory address for the default provider', async () => {
    const adapter = adapters.viemAdapter
    const instance = new ComposableCowPoller(pollerAddress)
    const readContract = jest.spyOn(adapter, 'readContract').mockResolvedValue(cowShedFactoryAddress)
    setGlobalAdapter(adapter)

    await expect(instance.getCowShedFactoryAddress()).resolves.toEqual(cowShedFactoryAddress)
    await expect(instance.getCowShedFactoryAddress()).resolves.toEqual(cowShedFactoryAddress)
    expect(readContract).toHaveBeenCalledTimes(1)

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
    const registerFromShedCalls = []
    const revokeCalls = []
    const revokeFromShedCalls = []

    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      registerCalls.push(poller.encodeRegister(SCHEDULE))
      registerFromShedCalls.push(poller.encodeRegisterFromShed(SCHEDULE))
      expect(poller.encodePollFunds(SCHEDULE_ID)).toEqual(POLL_FUNDS_CALLDATA)
      revokeCalls.push(poller.encodeRevoke(directRevoke))
      revokeFromShedCalls.push(poller.encodeRevokeFromShed(SCHEDULE))
    }

    expect(new Set(registerCalls).size).toEqual(1)
    expect(new Set(registerFromShedCalls).size).toEqual(1)
    expect(new Set(revokeCalls).size).toEqual(1)
    expect(new Set(revokeFromShedCalls).size).toEqual(1)

    const [registeredSchedule] = adapters.viemAdapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'registerFromShed',
      registerFromShedCalls[0]!,
    )
    expect(registeredSchedule.authEpoch).toEqual(SCHEDULE.authEpoch)

    const [handler, owner, salt] = adapters.viemAdapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'revoke',
      revokeCalls[0]!,
    )
    expect(handler.toLowerCase()).toEqual(SCHEDULE.handler)
    expect(owner.toLowerCase()).toEqual(SCHEDULE.owner)
    expect(salt).toEqual(SCHEDULE.salt)

    const [shedHandler, funder, shedOwner, shedSalt, authEpoch] =
      adapters.viemAdapter.utils.decodeFunctionData(
        ComposableCowPollerAbi,
        'revokeFromShed',
        revokeFromShedCalls[0]!,
      )
    expect(shedHandler.toLowerCase()).toEqual(SCHEDULE.handler)
    expect(funder.toLowerCase()).toEqual(SCHEDULE.funder)
    expect(shedOwner.toLowerCase()).toEqual(SCHEDULE.owner)
    expect(shedSalt).toEqual(SCHEDULE.salt)
    expect(authEpoch).toEqual(SCHEDULE.authEpoch)
  })

  test('builds the EIP-712 domain from the configured Poller address', () => {
    expect(poller.getEip712Domain(CHAIN_ID)).toEqual({
      name: 'ComposableCowPoller',
      version: '1',
      chainId: CHAIN_ID,
      verifyingContract: POLLER_ADDRESS,
    })
  })

  test('requires a Poller address to build EIP-712 data', () => {
    const instance = new ComposableCowPoller()

    expect(() => instance.getEip712Domain(CHAIN_ID)).toThrow('pollerAddress is required')
    expect(() =>
      instance.getRegisterTypedData({ chainId: CHAIN_ID, schedule: SCHEDULE, deadline: DEADLINE }),
    ).toThrow('pollerAddress is required')
    expect(() =>
      instance.getRevokeTypedData({
        chainId: CHAIN_ID,
        ...AUTHORIZATION,
        deadline: DEADLINE,
      }),
    ).toThrow('pollerAddress is required')
  })

  test('builds the register digest across adapters', () => {
    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      const typedData = poller.getRegisterTypedData({
        chainId: CHAIN_ID,
        schedule: SCHEDULE,
        deadline: DEADLINE,
      })

      expect(typedData.primaryType).toEqual('ScheduleRegistration')
      expect(adapter.utils.hashTypedData(typedData.domain, typedData.types, typedData.message)).toEqual(REGISTER_DIGEST)
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
    expect(schedule.authEpoch).toEqual(SCHEDULE.authEpoch)
    expect(schedule.funder.toLowerCase()).toEqual(SCHEDULE.funder)
    expect(schedule.owner.toLowerCase()).toEqual(SCHEDULE.owner)
    expect(schedule.salt).toEqual(SCHEDULE.salt)
    expect(schedule.staticInput).toEqual(SCHEDULE.staticInput)
    expect(adapters.viemAdapter.utils.toBigIntish(deadline)).toEqual(DEADLINE)
    expect(signature).toEqual(SIGNATURE)
  })

  test('builds the revoke digest across adapters', () => {
    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      const typedData = poller.getRevokeTypedData({
        chainId: CHAIN_ID,
        ...AUTHORIZATION,
        deadline: DEADLINE,
      })

      expect(typedData.primaryType).toEqual('Revoke')
      expect(adapter.utils.hashTypedData(typedData.domain, typedData.types, typedData.message)).toEqual(REVOKE_DIGEST)
    }
  })

  test('encodes signed revocation calldata across adapters', () => {
    const encodedCalls = []

    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      encodedCalls.push(poller.encodeRevokeWithSignature(AUTHORIZATION, DEADLINE, SIGNATURE))
    }

    expect(new Set(encodedCalls).size).toEqual(1)

    const [handler, funder, owner, salt, authEpoch, deadline, signature] = adapters.viemAdapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'revokeWithSignature',
      encodedCalls[0]!,
    )

    expect(handler.toLowerCase()).toEqual(AUTHORIZATION.handler)
    expect(funder.toLowerCase()).toEqual(AUTHORIZATION.funder)
    expect(owner.toLowerCase()).toEqual(AUTHORIZATION.owner)
    expect(salt).toEqual(AUTHORIZATION.salt)
    expect(authEpoch).toEqual(AUTHORIZATION.authEpoch)
    expect(deadline).toEqual(DEADLINE)
    expect(signature).toEqual(SIGNATURE)
  })
})
