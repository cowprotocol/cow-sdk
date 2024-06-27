export function atomsToAmount(value: bigint, decimals: number): string {
  return (value / BigInt(10 ** decimals)).toString()
}
