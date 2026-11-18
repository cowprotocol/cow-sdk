import { OrderKind, SigningScheme, BuyTokenDestination, SellTokenSource } from '../generated'
import { getProtocolFeeAmount } from './getProtocolFeeAmount'

const otherFields = {
  buyToken: '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab',
  sellToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  buyTokenBalance: BuyTokenDestination.ERC20,
  sellTokenBalance: SellTokenSource.ERC20,
  signingScheme: SigningScheme.EIP712,
  partiallyFillable: false,
  receiver: '0x0000000000000000000000000000000000000000',
  validTo: 1716904696,
  appData: '{}',
  appDataHash: '0x0',
  gasAmount: '0',
  gasPrice: '0',
  sellTokenPrice: '0',
}

describe('getProtocolFeeAmount', () => {
  describe('SELL orders', () => {
    it('reconstructs protocol fee from buyAmount', () => {
      // API returned buyAmount with protocol fee already deducted
      // Formula: protocolFeeAmount = buyAmount * feeBps / (10000 - feeBps)
      const protocolFeeBps = 20 // 0.20%
      const buyAmount = 18632013982n

      const result = getProtocolFeeAmount({
        orderParams: {
          kind: OrderKind.SELL,
          sellAmount: '156144455961718918',
          buyAmount: buyAmount.toString(),
          feeAmount: '3855544038281082',
          ...otherFields,
        },
        protocolFeeBps,
      })

      const expected = (buyAmount * 20n) / (10_000n - 20n)
      expect(result).toBe(expected)
      expect(result).toBe(37338705n)
    })

    it('handles decimal protocolFeeBps', () => {
      const protocolFeeBps = 0.003
      const buyAmount = 18632013982n

      const result = getProtocolFeeAmount({
        orderParams: {
          kind: OrderKind.SELL,
          sellAmount: '156144455961718918',
          buyAmount: buyAmount.toString(),
          feeAmount: '3855544038281082',
          ...otherFields,
        },
        protocolFeeBps,
      })

      // Scaled: feeBpsBig = 0.003 * 100_000 = 300
      // denominator = 10_000 * 100_000 - 300 = 999_999_700
      const feeBpsBig = BigInt(protocolFeeBps * 100_000)
      const denominator = 10_000n * 100_000n - feeBpsBig
      const expected = (buyAmount * feeBpsBig) / denominator

      expect(result).toBe(expected)
      expect(result).toBe(5589n)
    })
  })

  describe('BUY orders', () => {
    it('reconstructs protocol fee from sellAmount alone (NOT sellAmount + feeAmount)', () => {
      // API returned sellAmount with protocol fee already added, but network costs (feeAmount)
      // are NOT baked into sellAmount for BUY orders -- see README.md's "How sellAmount differs
      // between SELL and BUY orders" and getQuoteAmountsAndCosts.ts's own
      // `beforeAllFees.sellAmount = sellAmount - protocolFeeAmount` (no feeAmount term there).
      // Formula: protocolFeeAmount = sellAmount * feeBps / (10000 + feeBps)
      const protocolFeeBps = 20 // 0.20%
      const sellAmount = 168970833896526983n
      const feeAmount = 2947344072902629n // present in the order but must NOT affect the fee base

      const result = getProtocolFeeAmount({
        orderParams: {
          kind: OrderKind.BUY,
          sellAmount: sellAmount.toString(),
          buyAmount: '2000000000',
          feeAmount: feeAmount.toString(),
          ...otherFields,
        },
        protocolFeeBps,
      })

      const expected = (sellAmount * 20n) / (10_000n + 20n)
      expect(result).toBe(expected)
      expect(result).toBe(337267133526001n)
    })

    it('handles decimal protocolFeeBps', () => {
      const protocolFeeBps = 0.00071
      const sellAmount = 168970833896526983n
      const feeAmount = 2947344072902629n

      const result = getProtocolFeeAmount({
        orderParams: {
          kind: OrderKind.BUY,
          sellAmount: sellAmount.toString(),
          buyAmount: '2000000000',
          feeAmount: feeAmount.toString(),
          ...otherFields,
        },
        protocolFeeBps,
      })

      const feeBpsBig = BigInt(protocolFeeBps * 100_000)
      const denominator = 10_000n * 100_000n + feeBpsBig
      const expected = (sellAmount * feeBpsBig) / denominator

      expect(result).toBe(expected)
      expect(result).toBe(11996928354n)
    })

    it('is invariant to feeAmount -- changing feeAmount alone must not change the result', () => {
      // Direct regression for the bug: the old formula used (sellAmount + feeAmount) as its base,
      // so two orders with identical sellAmount but different feeAmount would (wrongly) produce
      // different protocol fee amounts. They must be identical.
      const protocolFeeBps = 20
      const sellAmount = 168970833896526983n

      const resultA = getProtocolFeeAmount({
        orderParams: {
          kind: OrderKind.BUY,
          sellAmount: sellAmount.toString(),
          buyAmount: '2000000000',
          feeAmount: '1',
          ...otherFields,
        },
        protocolFeeBps,
      })

      const resultB = getProtocolFeeAmount({
        orderParams: {
          kind: OrderKind.BUY,
          sellAmount: sellAmount.toString(),
          buyAmount: '2000000000',
          feeAmount: '999999999999999999',
          ...otherFields,
        },
        protocolFeeBps,
      })

      expect(resultA).toBe(resultB)
    })

    it('round-trips against the forward fee-adding formula the API uses (independent oracle)', () => {
      // Ground truth, independent of getProtocolFeeAmount's own internals:
      // if beforeAllFees.sellAmount had protocolFeeBps added on top to produce orderParams.sellAmount,
      // then adding the fee back to (sellAmount - fee) via the forward formula must reproduce the
      // exact same fee, for every case. This is the invariant the old (sellAmount + feeAmount) base
      // violated -- see getProtocolFeeAmount.ts's PR body / commit for the numeric counterexample.
      const protocolFeeBps = 20
      const sellAmount = 168970833896526983n

      const fee = getProtocolFeeAmount({
        orderParams: {
          kind: OrderKind.BUY,
          sellAmount: sellAmount.toString(),
          buyAmount: '2000000000',
          feeAmount: '2947344072902629',
          ...otherFields,
        },
        protocolFeeBps,
      })

      const beforeAllFeesSell = sellAmount - fee
      const feeBpsBig = BigInt(protocolFeeBps * 100_000)
      const forwardRecomputedFee = (beforeAllFeesSell * feeBpsBig) / (10_000n * 100_000n)

      expect(forwardRecomputedFee).toBe(fee)
    })
  })
})
