import { suggestSlippageFromFee, SuggestSlippageFromFeeParams } from './suggestSlippageFromFee'

interface SuggestedFeeTest {
  fee: bigint
  factor: number
  expected: number | string
  description?: string
  only?: boolean
}

assertCases('handle different factors', [
  { fee: 20n, factor: 0, expected: 0 },
  { fee: 20n, factor: 1, expected: 1 },
  { fee: 20n, factor: 25, expected: 5 },
  { fee: 20n, factor: 50, expected: 10 },
  { fee: 20n, factor: 75, expected: 15 },
  { fee: 20n, factor: 100, expected: 20 },
  { fee: 20n, factor: 200, expected: 40 },
  { fee: 20n, factor: 100_000_000, expected: 20_000_000 },
])

assertCases('Handle atoms', [
  { fee: atoms(0.2), factor: 0, expected: 0 },
  { fee: atoms(0.2), factor: 25, expected: 50000000000000000 },
  { fee: atoms(0.2), factor: 50, expected: 100000000000000000 },
  { fee: atoms(0.2), factor: 75, expected: 150000000000000000 },
  { fee: atoms(0.2), factor: 100, expected: 200000000000000000 },
])

assertCases('Handle fee edge cases', [
  // Fee is negative, it should throw an error
  {
    fee: -100n,
    factor: 50,
    expected: 'Fee amount must be non-negative: -100',
    description: 'fee is negative',
  },

  // Fee is negative, it should throw an error
  {
    fee: 100n,
    factor: -50,
    expected: 'multiplyingFactorPercent must be non-negative: -50',
    description: 'multiplyingFactorPercent is negative',
  },
])

function atoms(amount: number) {
  return BigInt(amount * 1e18)
}

function assertCases(description: string, testCases: SuggestedFeeTest[]) {
  describe(description, () => {
    testCases.forEach(({ fee, factor, expected, description: testCaseDescription, only }) => {
      const shouldThrow = typeof expected === 'string'
      const expectedDescription = shouldThrow ? `should throw "${expected}"` : `should return ${expected} tokens`
      const caseDescription = testCaseDescription
        ? `When ${testCaseDescription}, ${expectedDescription}`
        : `suggestSlippageFromFee(fee=${fee}, factor=${factor}) ${expectedDescription}`

      const runTest = only ? it.only : it
      runTest(caseDescription, () => {
        // If expected is a string, it should throw an error
        const params: SuggestSlippageFromFeeParams = {
          feeAmount: fee,
          multiplyingFactorPercent: factor,
        }
        if (shouldThrow) {
          expect(() => suggestSlippageFromFee(params)).toThrow(expected)
        } else {
          const result = suggestSlippageFromFee(params)
          expect(Number(result)).toBe(expected)
        }
      })
    })
  })
}
