import { getSlippagePercent } from './slippage'

interface SlippageTest {
  sellBefore: bigint
  sellAfter: bigint
  slippage: bigint
  expected: number | string
  description?: string
  only?: boolean
}

const baseParams = { sellBefore: 120n, sellAfter: 100n }

describe('getSlippagePercent', () => {
  describe('Sell orders', () => {
    const isSell = true

    assertCases('handle standard cases', isSell, [
      { ...baseParams, slippage: 0n, expected: 0 }, // 0%
      { ...baseParams, slippage: 5n, expected: 0.05 }, // 5%
      { ...baseParams, slippage: 10n, expected: 0.1 }, // 10%
      { ...baseParams, slippage: 20n, expected: 0.2 }, // 20%
      { ...baseParams, slippage: 100n, expected: 1 }, // 100%
      { ...baseParams, slippage: 101n, expected: 1.01 }, // 101%
      { ...baseParams, slippage: 10_000n, expected: 100 }, // 10_000%
    ])

    assertCases('handle error cases', isSell, [
      { ...baseParams, sellAfter: -10n, slippage: 20n, expected: 'sellAmount must be non-negative: -10' },
      { ...baseParams, slippage: -1n, expected: 'slippage must be non-negative: -1' },
    ])

    assertCases('handle precision cases', isSell, [
      { sellBefore: 10000000n, sellAfter: 10000000n, slippage: 123456n, expected: 0.0123456 },
    ])
  })

  describe('Buy orders', () => {
    const isSell = false

    assertCases('handle standard cases', isSell, [
      { ...baseParams, slippage: 0n, expected: 0 }, // 0%
      { ...baseParams, slippage: 3n, expected: 0.025 }, // 2.5% (2.5% of 120 --> 3)
      { ...baseParams, slippage: 6n, expected: 0.05 }, // 5%
      { ...baseParams, slippage: 12n, expected: 0.1 }, // 10%
      { ...baseParams, slippage: 120n, expected: 1 }, // 100%
      { ...baseParams, slippage: 121n, expected: 1.008333 }, // 100.8333%
      { ...baseParams, slippage: 10_000n, expected: 83.333333 }, // 8,333.3333%
    ])

    assertCases('handle error cases', isSell, [
      { ...baseParams, sellBefore: -10n, slippage: 20n, expected: 'sellAmount must be non-negative: -10' },
      { ...baseParams, slippage: -1n, expected: 'slippage must be non-negative: -1' },
    ])

    assertCases('handle precision cases', isSell, [
      { sellBefore: 10000000n, sellAfter: 10000000n, slippage: 123456n, expected: 0.012345 },
    ])
  })
})

function assertCases(description: string, isSell: boolean, testCases: SlippageTest[]) {
  describe(description, () => {
    testCases.forEach(({ sellBefore, sellAfter, slippage, expected, description: testCaseDescription, only }) => {
      const shouldThrow = typeof expected === 'string'
      const caseDescription = testCaseDescription
        ? `When ${testCaseDescription}`
        : `getSlippagePercent(sellBefore=${sellBefore}, sellAfter=${sellAfter}, slippage=${slippage}) should ${shouldThrow ? 'throw "' + expected + '"' : 'return ' + expected}`

      const runTest = only ? it.only : it
      runTest(`[${isSell ? 'sell' : 'buy'}] ${caseDescription}`, () => {
        if (shouldThrow) {
          expect(() =>
            getSlippagePercent({
              isSell,
              sellAmountBeforeNetworkCosts: sellBefore,
              sellAmountAfterNetworkCosts: sellAfter,
              slippage,
            }),
          ).toThrow(expected as string)
        } else {
          const result = getSlippagePercent({
            isSell,
            sellAmountBeforeNetworkCosts: sellBefore,
            sellAmountAfterNetworkCosts: sellAfter,
            slippage,
          })
          expect(result).toBeCloseTo(expected as number, 6) // Using toBeCloseTo with 6 decimal precision
        }
      })
    })
  })
}
