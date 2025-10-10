export function addPercentToValue(value: bigint, percent: number): bigint {
  return (value * BigInt(percent + 100)) / 100n
}
