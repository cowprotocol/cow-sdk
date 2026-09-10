import type { DeriveTwapStatusParams, TwapStatus } from './twap-types'

/** Derives the TWAP status from its lifecycle, schedule, and executed amounts. */
export function deriveTwapStatus(params: DeriveTwapStatusParams): TwapStatus {
  const {
    lifecycleStatus,
    executedAmounts: { executedSellAmount },
    schedule: { partSellAmount, numberOfParts, effectiveStartTime, timeBetweenParts },
  } = params

  const totalSellAmount = partSellAmount * BigInt(numberOfParts)

  if (totalSellAmount > 0n && executedSellAmount >= totalSellAmount) return 'filled'

  const endTime = effectiveStartTime + timeBetweenParts * numberOfParts
  const now = Math.ceil(Date.now() / 1000)

  if (lifecycleStatus === 'Active' && now <= endTime) return 'open'
  if (executedSellAmount > 0n) return 'partiallyFilled'

  return lifecycleStatus === 'Cancelled' ? 'cancelled' : 'expired'
}
