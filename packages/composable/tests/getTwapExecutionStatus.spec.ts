import { getTwapExecutionStatus, type GetTwapExecutionStatusParams } from '../src'

const OPEN_ORDER = {
  status: 'Active',
  executedSellAmount: 0n,
  partSellAmount: 10n,
  numberOfParts: 4,
  effectiveStartTime: 100,
  timeBetweenParts: 10,
  now: 120,
} as const satisfies GetTwapExecutionStatusParams

describe('getTwapExecutionStatus', () => {
  it('keeps an active order open through its scheduled end', () => {
    expect(getTwapExecutionStatus({ ...OPEN_ORDER, now: 140 })).toBe('open')
  })

  it('gives a full fill precedence over cancellation', () => {
    expect(
      getTwapExecutionStatus({
        ...OPEN_ORDER,
        status: 'Cancelled',
        executedSellAmount: 40n,
      }),
    ).toBe('filled')
  })

  it('preserves explicit cancellation and reports progress separately', () => {
    expect(
      getTwapExecutionStatus({
        ...OPEN_ORDER,
        status: 'Cancelled',
        executedSellAmount: 10n,
      }),
    ).toBe('cancelled')
  })

  it('classifies a terminal partial fill', () => {
    expect(
      getTwapExecutionStatus({
        ...OPEN_ORDER,
        status: 'Completed',
        executedSellAmount: 10n,
      }),
    ).toBe('partiallyFilled')
  })

  it('classifies an active order after its schedule as partially filled', () => {
    expect(getTwapExecutionStatus({ ...OPEN_ORDER, executedSellAmount: 10n, now: 141 })).toBe('partiallyFilled')
  })

  it('classifies a terminal order without execution as expired', () => {
    expect(getTwapExecutionStatus({ ...OPEN_ORDER, status: 'Completed' })).toBe('expired')
  })
})
