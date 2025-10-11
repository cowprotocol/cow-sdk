export function addPercentToValue(value: bigint, percent: number): bigint {
  return (value * BigInt(Math.round((percent + 100) * 100))) / 10000n
}
