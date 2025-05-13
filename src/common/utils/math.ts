/**
 * Convert a percentage to a bps value.
 *
 * It rounds up.
 *
 * @param percentage - The percentage to convert
 * @returns The bps value
 */
export function percentageToBps(percentage: number | bigint): number {
  const bps = typeof percentage === 'bigint' ? Number(percentage * 10_000n) : percentage * 10_000
  return Math.ceil(bps)
}

/**
 * Apply a percentage to a bigint value
 * @param value - The value to apply the percentage to
 * @param percentage - The percentage to apply
 * @returns The value after applying the percentage
 */
export function applyPercentage(value: bigint, percentage: number): bigint {
  return (value * BigInt(percentage)) / 100n
}
