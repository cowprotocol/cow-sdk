import { setGlobalAdapter } from '@cowprotocol/sdk-common'

import { ComposableCowPoller, type ComposableCowPollerSchedule } from '../src'
import { ComposableCowPollerAbi } from '../src/abis/ComposableCowPollerAbi'
import { createAdapters } from './setup'

const SCHEDULE: ComposableCowPollerSchedule = {
  handler: '0x1111111111111111111111111111111111111111',
  authEpoch: 7n,
  funder: '0x2222222222222222222222222222222222222222',
  owner: '0x3333333333333333333333333333333333333333',
  salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
  staticInput: '0x1234',
}

describe('ComposableCowPoller.encodeRevokeFromShed', () => {
  const adapters = createAdapters()
  const poller = new ComposableCowPoller()

  test('encodes the audited revokeFromShed selector and arguments across adapters', () => {
    const encodedCalls = []

    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      encodedCalls.push(poller.encodeRevokeFromShed(SCHEDULE))
    }

    expect(new Set(encodedCalls).size).toEqual(1)
    expect(encodedCalls[0]?.slice(0, 10)).toEqual('0x526c2744')

    const [handler, funder, owner, salt, authEpoch] = adapters.viemAdapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'revokeFromShed',
      encodedCalls[0]!,
    )
    expect(handler.toLowerCase()).toEqual(SCHEDULE.handler)
    expect(funder.toLowerCase()).toEqual(SCHEDULE.funder)
    expect(owner.toLowerCase()).toEqual(SCHEDULE.owner)
    expect(salt).toEqual(SCHEDULE.salt)
    expect(authEpoch).toEqual(SCHEDULE.authEpoch)
  })
})
