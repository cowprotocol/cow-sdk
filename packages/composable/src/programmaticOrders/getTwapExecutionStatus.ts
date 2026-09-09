import type { GetTwapExecutionStatusParams, TwapExecutionStatus } from './twap-types'

/** Derives the execution state shared by TWAP consumers. */
export function getTwapExecutionStatus({
  status,
  executedSellAmount,
  partSellAmount,
  numberOfParts,
  effectiveStartTime,
  timeBetweenParts,
  now,
}: GetTwapExecutionStatusParams): TwapExecutionStatus {
  const totalSellAmount = partSellAmount * BigInt(numberOfParts)

  if (totalSellAmount > 0n && executedSellAmount >= totalSellAmount) return 'filled'
  if (status === 'Cancelled') return 'cancelled'

  const endTime = effectiveStartTime + timeBetweenParts * numberOfParts

  if (status === 'Active' && now <= endTime) return 'open'
  if (executedSellAmount > 0n) return 'partiallyFilled'

  return 'expired'
}
