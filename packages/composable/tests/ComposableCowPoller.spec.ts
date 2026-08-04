import { ComposableCowPollerAbi } from '../src'

describe('ComposableCowPoller ABI', () => {
  test('exports the complete interface', () => {
    expect(ComposableCowPollerAbi.find((item) => item.type === 'constructor')).toMatchObject({
      inputs: [{ name: '_composableCow', type: 'address' }],
    })
    expect(ComposableCowPollerAbi.filter((item) => item.type === 'function').map((item) => item.name)).toEqual([
      'COMPOSABLE_COW',
      'eip712Domain',
      'funded',
      'nonces',
      'pollFunds',
      'register',
      'registerWithSignature',
      'revoke',
      'revokeWithSignature',
      'scheduleId',
      'schedules',
    ])
    expect(ComposableCowPollerAbi.filter((item) => item.type === 'event').map((item) => item.name)).toEqual([
      'EIP712DomainChanged',
      'Pulled',
      'ScheduleRegistered',
      'ScheduleRevoked',
    ])
    expect(ComposableCowPollerAbi.filter((item) => item.type === 'error').map((item) => item.name)).toEqual([
      'AlreadyRegistered',
      'InvalidShortString',
      'InvalidSignature',
      'NoSchedule',
      'OnlyFunder',
      'OrderNotLive',
      'SignatureExpired',
      'StringTooLong',
    ])
  })

  test('matches the final observable shape', () => {
    expect(ComposableCowPollerAbi.find((item) => item.type === 'function' && item.name === 'pollFunds')).toMatchObject(
      { outputs: [{ name: '', type: 'bool', internalType: 'bool' }] },
    )
    expect(ComposableCowPollerAbi.find((item) => item.type === 'event' && item.name === 'Pulled')).toMatchObject({
      inputs: expect.arrayContaining([expect.objectContaining({ name: 'orderDigest', indexed: true })]),
    })
    expect(
      ComposableCowPollerAbi.find((item) => item.type === 'event' && item.name === 'ScheduleRegistered'),
    ).toMatchObject({
      inputs: expect.arrayContaining([expect.objectContaining({ name: 'paramsHash', indexed: false })]),
    })
  })
})
