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
    it('reconstructs protocol fee from sellAmount + feeAmount', () => {
      // API returned sellAmount with protocol fee already added
      // Formula: protocolFeeAmount = (sellAmount + feeAmount) * feeBps / (10000 + feeBps)
      const protocolFeeBps = 20 // 0.20%
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

      const sellAfterNetwork = sellAmount + feeAmount
      const expected = (sellAfterNetwork * 20n) / (10_000n + 20n)
      expect(result).toBe(expected)
      expect(result).toBe(343150055827204n)
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

      const sellAfterNetwork = sellAmount + feeAmount
      const feeBpsBig = BigInt(protocolFeeBps * 100_000)
      const denominator = 10_000n * 100_000n + feeBpsBig
      const expected = (sellAfterNetwork * feeBpsBig) / denominator

      expect(result).toBe(expected)
      expect(result).toBe(12206189769n)
    })
  })
})
