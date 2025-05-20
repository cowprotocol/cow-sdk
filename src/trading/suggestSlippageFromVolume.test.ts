import { suggestSlippageFromVolume, SuggestSlippageFromVolumeParams } from './suggestSlippageFromVolume'

interface SuggestedFeeTest {
  sellBefore: bigint
  sellAfter: bigint
  percentage: number
  expected: number | string
  description?: string
  only?: boolean
}

const baseParams = { isSell: true, sellBefore: 20n, sellAfter: 15n }
const baseParamsAtoms = { isSell: true, sellBefore: atoms(20), sellAfter: atoms(15) }

describe('Sell orders', () => {
  const isSell = true

  assertCases('handle different factors', isSell, [
    { ...baseParams, percentage: 0, expected: 0 }, // round(15*0) = 0
    { ...baseParams, percentage: 0.5, expected: 0 }, // round(15*0.005) = 0
    { ...baseParams, percentage: 3, expected: 0 }, // round(15*0.03) = 0
    { ...baseParams, percentage: 4, expected: 1 }, // round(15*0.04) = 1
    { ...baseParams, percentage: 10, expected: 2 }, // round(15*0.1) = 2
    { ...baseParams, percentage: 25, expected: 4 }, // round(15*0.25) = 4
    { ...baseParams, percentage: 50, expected: 8 }, // round(15*0.5) = 8
    { ...baseParams, percentage: 100, expected: 15 }, // round(15*1) = 15
    { ...baseParams, percentage: 100_000_000, expected: 15_000_000 },
  ])

  assertCases('Handle atoms', isSell, [
    { ...baseParamsAtoms, percentage: 0, expected: 0 },
    { ...baseParamsAtoms, percentage: 0.5, expected: 75000000000000000 },
    { ...baseParamsAtoms, percentage: 10, expected: 1500000000000000000 },
    { ...baseParamsAtoms, percentage: 100_000_000, expected: 1.5e25 },
  ])

  assertCases('Handle edge case with sellAmount', isSell, [
    // sellBefore is 0: returns maximum slippage
    {
      ...baseParams,
      sellAfter: -10n,
      percentage: 0.5,
      expected: 'sellAmount must be non-negative: -10',
      description: 'sellAmountAfterFees is 0, sellBefore is 0',
    },

    {
      ...baseParams,
      percentage: -0.5,
      expected: 'slippagePercent must be non-negative: -0.5',
      description: 'amount is 0, sellBefore is not 0',
    },
  ])
})

describe('Buy orders', () => {
  const isSell = false

  assertCases('handle different factors', isSell, [
    { ...baseParams, percentage: 0, expected: 0 }, // round(20*0) = 0
    { ...baseParams, percentage: 0.5, expected: 0 }, // round(20*0.005) = 0
    { ...baseParams, percentage: 2.4, expected: 0 }, // round(20*0.024) = 0
    { ...baseParams, percentage: 2.5, expected: 1 }, // round(20*0.025) = 1
    { ...baseParams, percentage: 2.6, expected: 1 }, // round(20*0.026) = 1
    { ...baseParams, percentage: 10, expected: 2 }, // round(20*0.1) = 2
    { ...baseParams, percentage: 25, expected: 5 }, // round(20*0.25) = 5
    { ...baseParams, percentage: 50, expected: 10 }, // round(20*0.5) = 10
    { ...baseParams, percentage: 100, expected: 20 }, // round(20*1) = 20
    { ...baseParams, percentage: 100_000_000, expected: 20_000_000 }, // round(20*1) = 20
  ])

  assertCases('Handle atoms', isSell, [
    { ...baseParamsAtoms, percentage: 0, expected: 0 },
    { ...baseParamsAtoms, percentage: 0.5, expected: 100000000000000000 },
    { ...baseParamsAtoms, percentage: 10, expected: 2000000000000000000 },
    { ...baseParamsAtoms, percentage: 100_000_000, expected: 2e25 },
  ])

  assertCases('Handle edge case with sellAmount', isSell, [
    // sellBefore is 0: returns maximum slippage
    {
      ...baseParams,
      sellBefore: -10n,
      percentage: 0.5,
      expected: 'sellAmount must be non-negative: -10',
      description: 'sellAmountAfterFees is 0, sellBefore is 0',
    },
  ])
})

function atoms(amount: number) {
  return BigInt(amount * 1e18)
}

function assertCases(description: string, isSell: boolean, testCases: SuggestedFeeTest[]) {
  describe(description, () => {
    testCases.forEach(({ sellAfter, sellBefore, percentage, expected, description: testCaseDescription, only }) => {
      const shouldThrow = typeof expected === 'string'
      const expectedDescription = shouldThrow ? `should throw "${expected}"` : `should return ${expected} tokens`
      const caseDescription = testCaseDescription
        ? `When ${testCaseDescription}, ${expectedDescription}`
        : `suggestSlippageFromVolume(sellAmountBeforeNetworkCosts=${sellBefore}, sellAmountAfterNetworkCosts=${sellAfter}, slippagePercent=${percentage}) ${expectedDescription}`

      const runTest = only ? it.only : it
      runTest(`[${isSell ? 'sell' : 'buy'}] ${caseDescription}`, () => {
        // If expected is a string, it should throw an error
        const params: SuggestSlippageFromVolumeParams = {
          isSell,
          sellAmountBeforeNetworkCosts: sellBefore,
          sellAmountAfterNetworkCosts: sellAfter,
          slippagePercent: percentage,
        }
        if (shouldThrow) {
          expect(() => suggestSlippageFromVolume(params)).toThrow(expected)
        } else {
          const result = suggestSlippageFromVolume(params)
          expect(Number(result)).toBe(expected)
        }
      })
    })
  })
}
