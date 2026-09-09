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

describe('ComposableCowPoller.encodeRegisterFromShed', () => {
  const adapters = createAdapters()
  const poller = new ComposableCowPoller()

  test('encodes the audited registerFromShed selector and arguments across adapters', () => {
    const encodedCalls = []

    for (const adapter of Object.values(adapters)) {
      setGlobalAdapter(adapter)
      encodedCalls.push(poller.encodeRegisterFromShed(SCHEDULE))
    }

    expect(new Set(encodedCalls).size).toEqual(1)
    expect(encodedCalls[0]?.slice(0, 10)).toEqual('0x81b1b677')

    const [schedule] = adapters.viemAdapter.utils.decodeFunctionData(
      ComposableCowPollerAbi,
      'registerFromShed',
      encodedCalls[0]!,
    )
    expect(schedule).toEqual(SCHEDULE)
  })
})
