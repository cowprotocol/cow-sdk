const BPS_FACTOR = 10_000n

/**
 * Convert a percentage to a bps value.
 *
 * It rounds up.
 *
 * @param percentage - The percentage to convert
 * @returns The bps value
 */
export function percentageToBps(percentage: number | bigint): number {
  const bps = typeof percentage === 'bigint' ? Number(percentage * BPS_FACTOR) : percentage * Number(BPS_FACTOR)
  return Math.ceil(bps)
}

/**
 * Apply a percentage to a bigint value
 *
 * Rounds up.
 *
 * @param value - The value to apply the percentage to
 * @param percentage - The percentage to apply
 * @returns The value after applying the percentage
 */
export function applyPercentage(value: bigint, percentage: number): bigint {
  const valueMultiplied = value * BigInt(percentage)
  const roundUp = valueMultiplied % 100n !== 0n ? 1n : 0n

  return valueMultiplied / 100n + roundUp
}
