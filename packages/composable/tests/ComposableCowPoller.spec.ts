import * as composable from '../src'
import { ComposableCowPollerAbi } from '../src/abis/ComposableCowPollerAbi'

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
