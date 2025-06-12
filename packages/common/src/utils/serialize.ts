export const jsonWithBigintReplacer = (_key: string, value: unknown) => {
  // Handle BigInt
  if (typeof value === 'bigint') {
    return value.toString()
  }
  // Handle BigNumber (if you're using ethers.BigNumber)
  if (typeof value === 'object' && value !== null && '_isBigNumber' in value) {
    return value.toString()
  }
  return value
}
