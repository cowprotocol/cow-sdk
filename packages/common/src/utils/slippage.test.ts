import {
  getSlippagePercent,
  suggestSlippageBps,
  suggestSlippageFromFee,
  suggestSlippageFromVolume,
  SuggestSlippageBpsParams,
  SuggestSlippageFromFeeParams,
  SuggestSlippageFromVolumeParams,
} from './slippage'

function atoms(amount: number) {
  return BigInt(amount * 1e18)
}

describe('getSlippagePercent', () => {
  interface SlippageTest {
    sellBefore: bigint
    sellAfter: bigint
    slippage: bigint
    expected: number | string
    description?: string
    only?: boolean
  }

  const baseParams = { sellBefore: 120n, sellAfter: 100n }

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
      { ...baseParams, sellAfter: -10n, slippage: 20n, expected: 'sellAmount must be greater than 0: -10' },
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
      { ...baseParams, sellBefore: -10n, slippage: 20n, expected: 'sellAmount must be greater than 0: -10' },
      { ...baseParams, slippage: -1n, expected: 'slippage must be non-negative: -1' },
    ])

    assertCases('handle precision cases', isSell, [
      { sellBefore: 10000000n, sellAfter: 10000000n, slippage: 123456n, expected: 0.012345 },
    ])
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
})

describe('suggestSlippageFromFee', () => {
  interface SuggestedFeeTest {
    fee: bigint
    factor: number
    expected: number | string
    description?: string
    only?: boolean
  }

  assertCases('handle different factors', [
    { fee: 20n, factor: 0, expected: 0 }, // round(20*0) = 0
    { fee: 20n, factor: 1, expected: 0 }, // round(20*0.01) = 0
    { fee: 20n, factor: 2, expected: 0 }, // round(20*0.02) = 0
    { fee: 20n, factor: 3, expected: 1 }, // round(20*0.03) = 1
    { fee: 20n, factor: 25, expected: 5 }, // round(20*0.25) = 5
    { fee: 20n, factor: 50, expected: 10 }, // round(20*0.5) = 10
    { fee: 20n, factor: 75, expected: 15 }, // round(20*0.75) = 15
    { fee: 20n, factor: 100, expected: 20 }, // round(20*1) = 20
    { fee: 20n, factor: 200, expected: 40 }, // round(20*2) = 40
    { fee: 20n, factor: 100_000_000, expected: 20_000_000 }, // round(20*1) = 20
  ])

  assertCases('Handle atoms', [
    { fee: atoms(0.2), factor: 0, expected: 0 }, // round(0.2*1e18*0) = 0
    { fee: atoms(0.2), factor: 1, expected: 2000000000000000 }, // round(0.2*1e18*0.01) = 2,000,000,000,000,000
    { fee: atoms(0.2), factor: 2, expected: 4000000000000000 }, // round(0.2*1e18*0.02) = 4,000,000,000,000,000
    { fee: atoms(0.2), factor: 3, expected: 6000000000000000 }, // round(0.2*1e18*0.03) = round(0.2*1e18*0.03)
    { fee: atoms(0.2), factor: 25, expected: 50000000000000000 }, // round(0.2*1e18*0.25) = 50000000000000000
    { fee: atoms(0.2), factor: 50, expected: 100000000000000000 }, // round(0.2*1e18*0.5) = 100000000000000000
    { fee: atoms(0.2), factor: 75, expected: 150000000000000000 }, // round(0.2*1e18*0.75) = 150000000000000000
    { fee: atoms(0.2), factor: 100, expected: 200000000000000000 }, // round(0.2*1e18*1) = 200000000000000000
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
})

describe('suggestSlippageFromVolume', () => {
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
      // sellAfter is negative: it throws an error
      {
        ...baseParams,
        sellAfter: -10n,
        percentage: 0.5,
        expected: 'sellAmount must be greater than 0: -10',
        description: 'sellAmountAfterFees is 0, sellBefore is 0',
      },

      // sellAfter is 0: it throws an error
      {
        ...baseParams,
        sellAfter: 0n,
        percentage: 0.5,
        expected: 'sellAmount must be greater than 0: 0',
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
      // sellBefore is negative: it throws an error
      {
        ...baseParams,
        sellBefore: -10n,
        percentage: 0.5,
        expected: 'sellAmount must be greater than 0: -10',
        description: 'sellAmountAfterFees is 0, sellBefore is 0',
      },

      // sellBefore is 0: it throws an error
      {
        ...baseParams,
        sellBefore: 0n,
        percentage: 0.5,
        expected: 'sellAmount must be greater than 0: 0',
        description: 'sellAmountAfterFees is 0, sellBefore is 0',
      },
    ])
  })

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
})

describe('suggestSlippageBps', () => {
  const baseParams: SuggestSlippageBpsParams = {
    isSell: true,
    feeAmount: 1884782955316140n,
    sellAmountBeforeNetworkCosts: 100000000000000000n,
    sellAmountAfterNetworkCosts: 98115217044683860n,
  }

  it('combines the fee and volume heuristics into a single bps suggestion', () => {
    // slippageBpsFromFee = suggestSlippageFromFee(1884782955316140, 50%) = 942391477658070
    // slippageBpsFromVolume = suggestSlippageFromVolume(sell, 98115217044683860, 0.5%) = 490576085223419
    // total = 1432967562881489, as a percent of sellAmountAfterNetworkCosts -> ~1.4606%, ~146 bps
    const result = suggestSlippageBps(baseParams)

    expect(result).toBe(146)
  })

  it('scales linearly with volumeMultiplierPercent', () => {
    const params: SuggestSlippageBpsParams = {
      isSell: true,
      feeAmount: 0n,
      sellAmountBeforeNetworkCosts: 1_000_000_000n,
      sellAmountAfterNetworkCosts: 1_000_000_000n,
    }

    // Zero fee and equal before/after amounts mean the volume multiplier percent maps 1:1 to bps.
    expect(suggestSlippageBps({ ...params, volumeMultiplierPercent: 0.5 })).toBe(50)
    expect(suggestSlippageBps({ ...params, volumeMultiplierPercent: 2 })).toBe(200)
  })

  describe('Lower bound clamping', () => {
    it('clamps to 0 by default when the calculated slippage would be negative', () => {
      const result = suggestSlippageBps({
        isSell: true,
        feeAmount: 0n,
        sellAmountBeforeNetworkCosts: 1_000_000_000n,
        sellAmountAfterNetworkCosts: 1_000_000_000n,
        volumeMultiplierPercent: 0,
      })

      expect(result).toBe(0)
    })

    it('clamps to lowerCapBps when the calculated slippage is below it', () => {
      const result = suggestSlippageBps({
        isSell: true,
        feeAmount: 0n,
        sellAmountBeforeNetworkCosts: 1_000_000_000n,
        sellAmountAfterNetworkCosts: 1_000_000_000n,
        volumeMultiplierPercent: 0,
        lowerCapBps: 50,
      })

      expect(result).toBe(50)
    })

    it('does not clamp when the calculated slippage is above lowerCapBps', () => {
      const result = suggestSlippageBps({
        isSell: true,
        feeAmount: 0n,
        sellAmountBeforeNetworkCosts: 1_000_000_000n,
        sellAmountAfterNetworkCosts: 1_000_000_000n,
        volumeMultiplierPercent: 2,
        lowerCapBps: 50,
      })

      expect(result).toBe(200)
    })
  })

  describe('Upper bound clamping', () => {
    it('clamps to MAX_SLIPPAGE_BPS (10000) when the calculated slippage exceeds 100%', () => {
      const result = suggestSlippageBps({
        isSell: true,
        feeAmount: 0n,
        sellAmountBeforeNetworkCosts: 1_000_000_000n,
        sellAmountAfterNetworkCosts: 1_000_000_000n,
        volumeMultiplierPercent: 150,
      })

      expect(result).toBe(10000)
    })

    it('does not clamp when the calculated slippage is exactly at MAX_SLIPPAGE_BPS', () => {
      const result = suggestSlippageBps({
        isSell: true,
        feeAmount: 0n,
        sellAmountBeforeNetworkCosts: 1_000_000_000n,
        sellAmountAfterNetworkCosts: 1_000_000_000n,
        volumeMultiplierPercent: 100,
      })

      expect(result).toBe(10000)
    })
  })
})
