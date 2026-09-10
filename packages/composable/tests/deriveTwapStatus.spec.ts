import { deriveTwapStatus, type DeriveTwapStatusParams } from '../src'

const OPEN_ORDER = {
  lifecycleStatus: 'Active',
  executedAmounts: { executedSellAmount: 0n },
  schedule: {
    partSellAmount: 10n,
    numberOfParts: 4,
    effectiveStartTime: 100,
    timeBetweenParts: 10,
  },
} as const satisfies DeriveTwapStatusParams

describe('deriveTwapStatus', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(120_000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('keeps an active order open through its scheduled end', () => {
    jest.mocked(Date.now).mockReturnValue(140_000)
    expect(deriveTwapStatus(OPEN_ORDER)).toBe('open')
  })

  it('gives a full fill precedence over cancellation', () => {
    expect(
      deriveTwapStatus({
        ...OPEN_ORDER,
        lifecycleStatus: 'Cancelled',
        executedAmounts: { executedSellAmount: 40n },
      }),
    ).toBe('filled')
  })

  it('gives a partial fill precedence over cancellation', () => {
    expect(
      deriveTwapStatus({
        ...OPEN_ORDER,
        lifecycleStatus: 'Cancelled',
        executedAmounts: { executedSellAmount: 10n },
      }),
    ).toBe('partiallyFilled')
  })

  it('keeps an active partially executed order open', () => {
    expect(deriveTwapStatus({ ...OPEN_ORDER, executedAmounts: { executedSellAmount: 10n } })).toBe('open')
  })

  it('keeps a cancelled order without execution cancelled', () => {
    expect(deriveTwapStatus({ ...OPEN_ORDER, lifecycleStatus: 'Cancelled' })).toBe('cancelled')
  })

  it('expires an active order without execution after its schedule', () => {
    jest.mocked(Date.now).mockReturnValue(141_000)
    expect(deriveTwapStatus(OPEN_ORDER)).toBe('expired')
  })

  it('classifies a terminal partial fill', () => {
    expect(
      deriveTwapStatus({
        ...OPEN_ORDER,
        lifecycleStatus: 'Completed',
        executedAmounts: { executedSellAmount: 10n },
      }),
    ).toBe('partiallyFilled')
  })

  it('classifies an active order after its schedule as partially filled', () => {
    jest.mocked(Date.now).mockReturnValue(141_000)
    expect(deriveTwapStatus({ ...OPEN_ORDER, executedAmounts: { executedSellAmount: 10n } })).toBe('partiallyFilled')
  })

  it('classifies a terminal order without execution as expired', () => {
    expect(deriveTwapStatus({ ...OPEN_ORDER, lifecycleStatus: 'Completed' })).toBe('expired')
  })
})
