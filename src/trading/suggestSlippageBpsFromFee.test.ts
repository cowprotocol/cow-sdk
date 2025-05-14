import { suggestSlippageBpsFromFee } from './suggestSlippageBpsFromFee'

interface SuggestedFeeTest {
  fee: bigint
  sell: bigint
  factor: number
  expected: number | string
  description?: string
  only?: boolean
}

describe('Sell orders', () => {
  const isSell = true

  assertCases('handle different factors', isSell, [
    // expected = 1 - (100 - ceil(20 * 1.01)) / (100 - 20) = 0
    { fee: 20n, sell: 100n, factor: 1, expected: 125 },

    // expected = 1 - (100 - 20 * 1.25) / (100 - 20) = 0.125
    { fee: 20n, sell: 100n, factor: 25, expected: 625 },

    // expected = 1 - (100 - 20 * 1.50) / (100 - 20) = 0.125
    { fee: 20n, sell: 100n, factor: 50, expected: 1250 },

    // expected = 1 - (100 - 20 * 1.75) / (100 - 20) = 0.125
    { fee: 20n, sell: 100n, factor: 75, expected: 1875 },

    // expected = 1 - (100 - 20 * 2) / (100 - 20) = 0.125
    { fee: 20n, sell: 100n, factor: 100, expected: 2500 },

    // expected = 1 - (100 - 20 * 1.5) / (100 - 20) = 0.125
    { fee: 20n, sell: 100n, factor: 200, expected: 5000 },

    // Absurd factor, returns max slippage
    { fee: 20n, sell: 100n, factor: 100_000_000, expected: 10000 },
  ])

  assertCases('Handle atoms', isSell, [
    // expected = 1 - (1 - 0.2 * 1) / (1 - 0.2) = 0
    { fee: atoms(0.2), sell: atoms(1), factor: 0, expected: 50 },

    // expected = 1 - (1 - 0.2 * 1.25) / (1 - 0.2) = 0.125
    { fee: atoms(0.2), sell: atoms(1), factor: 25, expected: 625 },

    // expected = 1 - (1 - 0.2 * 1.5) / (1 - 0.2) = 0.125
    { fee: atoms(0.2), sell: atoms(1), factor: 50, expected: 1250 },

    // expected = 1 - (1 - 0.2 * 1.75) / (1 - 0.2) = 0.125
    { fee: atoms(0.2), sell: atoms(1), factor: 75, expected: 1875 },

    // expected = 1 - (1 - 0.2 * 1.5) / (1 - 0.2) = 0.125
    { fee: atoms(0.2), sell: atoms(1), factor: 100, expected: 2500 },
  ])

  assertCases('Handle minimum BPS', isSell, [
    // expected = 1 - (100 - 20 * 1.00) / (100 - 20) = 0
    { fee: 20n, sell: 100n, factor: 0, expected: 50 },

    // Fee is 0: returns maximum slippage
    {
      fee: 1n,
      sell: 10000n,
      factor: 50,
      expected: 50,
      description: 'If suggested slippage is too small, returns the minimum slippage (50 BPS)',
    },
  ])

  assertCases('Handle edge case with sellAmount', isSell, [
    // Fee is 0: returns maximum slippage
    { fee: 0n, sell: 0n, factor: 50, expected: 10_000, description: 'amount is 0, fee is 0' },

    // Fee is 0: returns maximum slippage
    { fee: 20n, sell: 0n, factor: 50, expected: 10_000, description: 'amount is 0, fee is not 0' },
  ])

  assertCases('Handle edge case with fees', isSell, [
    // Fee is 0
    //   expected = 1 - (100 - 20 * 1.5) / (100 - 20) = 0.125
    { fee: 0n, sell: 100n, factor: 50, expected: 50, description: 'fee is 0' },

    // Fee is all the sell amount
    //   expected = 1 - (100 - 20 * 1.5) / (100 - 20) = 0.125
    { fee: 100n, sell: 100n, factor: 50, expected: 10_000, description: 'fee is equal to sellAmount' },

    // Fee is bigger than the sell amount (should not happen)
    //   expected = 1 - (100 - 20 * 1.5) / (100 - 20) = 0.125
    { fee: 100n, sell: 100n, factor: 50, expected: 10_000, description: 'fee is bigger than sellAmount' },

    // Fee is negative, it should throw an error
    {
      fee: -100n,
      sell: 100n,
      factor: 50,
      expected: 'Fee amount cannot be negative: -100',
      description: 'fee is negative',
    },
  ])
})

describe('Buy orders', () => {
  const isSell = false

  assertCases('handle different factors', isSell, [
    // // expected = (100 + 20 * 1) / (100 + 20) - 1 = 0
    { fee: 20n, sell: 100n, factor: 0, expected: 50 },

    // // expected = (100 + 20 * 1.25) / (100 + 20) - 1 = 0.04166666667
    { fee: 20n, sell: 100n, factor: 25, expected: 417 },

    // expected = (100 + 20 * 1.5) / (100 + 20) - 1 = 0.08333333333
    { fee: 20n, sell: 100n, factor: 50, expected: 834 },

    // // expected = (100 + 20 * 1.75) / (100 + 20) - 1 = 0.125
    { fee: 20n, sell: 100n, factor: 75, expected: 1250 },

    // expected = (100 + 20 * 2) / (100 + 20) - 1 = 0.1666666667
    { fee: 20n, sell: 100n, factor: 100, expected: 1667 },

    // expected = (100 + 20 * 3) / (100 + 20) - 1 = 0.3333333333
    { fee: 20n, sell: 100n, factor: 200, expected: 3334 },

    // Absurd factor, returns max slippage
    { fee: 20n, sell: 100n, factor: 100_000_000, expected: 10000 },
  ])
})

function atoms(amount: number) {
  return BigInt(amount * 1e18)
}

function assertCases(description: string, isSell: boolean, testCases: SuggestedFeeTest[]) {
  describe(description, () => {
    testCases.forEach(({ sell, fee, factor, expected, description: testCaseDescription, only }) => {
      const shouldThrow = typeof expected === 'string'
      const expectedDescription = shouldThrow ? `should throw "${expected}"` : `should return ${expected} BPS`
      const caseDescription = testCaseDescription
        ? `When ${testCaseDescription}, ${expectedDescription}`
        : `suggestSlippageBpsFromFee(sell=${sell}, fee=${fee}, factor=${factor}) ${expectedDescription}`

      const runTest = only ? it.only : it
      runTest(`[${isSell ? 'sell' : 'buy'}] ${caseDescription}`, () => {
        // If expected is a string, it should throw an error
        const params = {
          feeAmount: fee,
          sellAmount: sell,
          isSell,
          multiplyingFactorPercent: factor,
        }
        if (shouldThrow) {
          expect(() => suggestSlippageBpsFromFee(params)).toThrow(expected)
        } else {
          const result = suggestSlippageBpsFromFee(params)
          expect(result).toBe(expected)
        }
      })
    })
  })
}
