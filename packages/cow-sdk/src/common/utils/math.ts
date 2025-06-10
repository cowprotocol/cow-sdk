const SCALE = 1e6 // 6 decimal places of precision. Used to avoid depending on Big Decimal libraries
const SCALE_BIGINT = BigInt(SCALE)
const BPS_FACTOR = 10_000n

/**
 * Convert a percentage to a bps value.
 *
 * It rounds to the nearest integer.
 *
 * @param percentage - The percentage to convert
 * @returns The bps value
 */
export function percentageToBps(percentage: number | bigint): number {
  const bps = typeof percentage === 'bigint' ? Number(percentage * BPS_FACTOR) : percentage * Number(BPS_FACTOR)
  return Math.round(bps)
}

/**
 * Apply a percentage to a bigint value
 *
 * Rounds to the nearest integer.
 *
 * @param value - The value to apply the percentage to
 * @param percentage - The percentage to apply
 * @returns The value after applying the percentage
 */
export function applyPercentage(value: bigint, percentage: number): bigint {
  const valueMultiplied = (value * BigInt(Math.floor(percentage * SCALE))) / SCALE_BIGINT

  const roundUp = valueMultiplied % 100n >= 50n ? 1n : 0n
  return valueMultiplied / 100n + roundUp
}
