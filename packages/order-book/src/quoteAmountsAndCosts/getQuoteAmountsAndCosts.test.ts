import { OrderParameters, OrderKind, SigningScheme, BuyTokenDestination, SellTokenSource } from '../generated'
import { getQuoteAmountsAndCosts } from './getQuoteAmountsAndCosts'

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

/**
 * The API returns amounts with network costs already baked in:
 * - sellAmount is the amount after network costs
 * - feeAmount is the network cost amount (stored separately for reference)
 * - buyAmount is correlated to the reduced sellAmount (also reflects network costs)
 *
 * In this order we are selling 0.16 WETH for ~18632 COW
 */
const SELL_ORDER: OrderParameters = {
  kind: OrderKind.SELL,
  sellAmount: '156144455961718918',
  feeAmount: '3855544038281082',
  buyAmount: '18632013982',
  ...otherFields,
}

/**
 * In this order we are buying 2000 COW for ~0.169 WETH
 */
const BUY_ORDER: OrderParameters = {
  kind: OrderKind.BUY,
  sellAmount: '168970833896526983',
  feeAmount: '2947344072902629',
  buyAmount: '2000000000',
  ...otherFields,
}

describe('Calculation of before/after fees amounts', () => {
  describe('Network costs', () => {
    describe('sell order', () => {
      const orderParams = SELL_ORDER

      it('afterNetworkCosts.sellAmount should equal the API sellAmount', () => {
        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps: undefined,
        })

        expect(result.afterNetworkCosts.sellAmount).toBe(BigInt(orderParams.sellAmount))
      })

      it('beforeNetworkCosts.sellAmount should be sellAmount + feeAmount for SELL orders', () => {
        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps: undefined,
        })

        expect(result.beforeNetworkCosts.sellAmount).toBe(
          BigInt(orderParams.sellAmount) + BigInt(orderParams.feeAmount),
        )
      })
    })

    describe('buy order', () => {
      const orderParams = BUY_ORDER

      it('afterNetworkCosts.sellAmount should equal sellAmount + feeAmount', () => {
        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps: undefined,
        })

        expect(result.afterNetworkCosts.sellAmount).toBe(BigInt(orderParams.sellAmount) + BigInt(orderParams.feeAmount))
      })

      it('beforeNetworkCosts.sellAmount should be sellAmount for BUY orders', () => {
        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps: undefined,
        })

        expect(result.beforeNetworkCosts.sellAmount).toBe(BigInt(orderParams.sellAmount))
      })
    })

    describe('sell order buyAmount', () => {
      const orderParams = SELL_ORDER

      it('beforeNetworkCosts.buyAmount should include network cost in buy currency', () => {
        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps: undefined,
        })

        const buyAmount = BigInt(orderParams.buyAmount)
        const networkCostAmountInBuyCurrency =
          (BigInt(orderParams.buyAmount) * BigInt(orderParams.feeAmount)) / BigInt(orderParams.sellAmount)

        expect(result.beforeNetworkCosts.buyAmount).toBe(buyAmount + networkCostAmountInBuyCurrency)
        expect(result.afterNetworkCosts.buyAmount).toBe(buyAmount)
      })
    })

    describe('buy order buyAmount', () => {
      const orderParams = BUY_ORDER

      it('buyAmount should not change with network costs (network costs only apply to sell)', () => {
        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps: undefined,
        })

        expect(result.afterNetworkCosts.buyAmount).toBe(result.beforeNetworkCosts.buyAmount)
      })
    })
  })

  describe('Partner fee', () => {
    const partnerFeeBps = 100

    describe('Sell order', () => {
      it('Partner fee should be substracted from buy amount after network costs', () => {
        const orderParams = SELL_ORDER
        const result = getQuoteAmountsAndCosts({
          orderParams,
          partnerFeeBps,
          slippagePercentBps: 0,
          protocolFeeBps: undefined,
        })

        // No protocol fee: beforeAllFees.buyAmount = buyAmount + networkCostInBuyCurrency
        const buyAmount = BigInt(orderParams.buyAmount)
        const networkCostInBuyCurrency =
          (BigInt(orderParams.buyAmount) * BigInt(orderParams.feeAmount)) / BigInt(orderParams.sellAmount)
        const buyBeforeAllFees = buyAmount + networkCostInBuyCurrency
        const expectedPartnerFeeAmount = (buyBeforeAllFees * BigInt(partnerFeeBps)) / 10_000n

        expect(result.costs.partnerFee.amount).toBe(expectedPartnerFeeAmount)
      })
    })

    describe('Buy order', () => {
      it('Partner fee should be added on top of sell amount after network costs', () => {
        const orderParams = BUY_ORDER
        const result = getQuoteAmountsAndCosts({
          orderParams,
          partnerFeeBps,
          slippagePercentBps: 0,
          protocolFeeBps: undefined,
        })

        // No protocol fee: beforeAllFees.sellAmount = sellAmount - 0 = sellAmount
        const sellAmount = BigInt(orderParams.sellAmount)
        const expectedPartnerFeeAmount = (sellAmount * BigInt(partnerFeeBps)) / 10_000n

        expect(result.costs.partnerFee.amount).toBe(expectedPartnerFeeAmount)
      })
    })
  })

  describe('Slippage', () => {
    const slippagePercentBps = 200 // 2%

    describe('Sell order', () => {
      it('Slippage should be substracted from buy amount after partner fees', () => {
        const orderParams = SELL_ORDER
        const result = getQuoteAmountsAndCosts({
          orderParams,
          partnerFeeBps: undefined,
          slippagePercentBps,
          protocolFeeBps: undefined,
        })

        const buyAfterNetworkCosts = BigInt(orderParams.buyAmount)
        const slippageAmount = (buyAfterNetworkCosts * BigInt(slippagePercentBps)) / 10_000n

        expect(result.afterSlippage.buyAmount).toBe(buyAfterNetworkCosts - slippageAmount)
      })
    })

    describe('Buy order', () => {
      it('Slippage should be added on top of sell amount after partner costs', () => {
        const orderParams = BUY_ORDER
        const result = getQuoteAmountsAndCosts({
          orderParams,
          partnerFeeBps: undefined,
          slippagePercentBps,
          protocolFeeBps: undefined,
        })

        // afterNetworkCosts.sellAmount = sellAmount + networkCostAmount
        const sellAmountAfterNetworkCosts = BigInt(orderParams.sellAmount) + BigInt(orderParams.feeAmount)
        const slippageAmount = (sellAmountAfterNetworkCosts * BigInt(slippagePercentBps)) / 10_000n

        expect(result.afterSlippage.sellAmount).toBe(sellAmountAfterNetworkCosts + slippageAmount)
      })
    })
  })

  describe('Protocol fee', () => {
    const protocolFeeBps = 20 // 0.20%

    describe('Sell order', () => {
      it('calculates protocol fee from quote amounts', () => {
        const orderParams = SELL_ORDER
        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        const buyAfter = BigInt(orderParams.buyAmount)
        const bps = BigInt(protocolFeeBps)
        const denominator = 10_000n - bps
        const expectedProtocolFeeAmount = (buyAfter * bps) / denominator

        expect(result.costs.protocolFee.amount).toBe(expectedProtocolFeeAmount)
        // beforeNetworkCosts.buyAmount for SELL = afterProtocolFees.buyAmount = buyAmount + networkCostInBuyCurrency
        const networkCostInBuyCurrency =
          (buyAfter * BigInt(orderParams.feeAmount)) / BigInt(orderParams.sellAmount)
        expect(result.beforeNetworkCosts.buyAmount).toBe(buyAfter + networkCostInBuyCurrency)
      })

      it('calculates partner fee on top of amounts before protocol fee', () => {
        const orderParams = SELL_ORDER
        const partnerFeeBps = 100

        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps,
          protocolFeeBps,
        })

        const buyAfter = BigInt(orderParams.buyAmount)
        const protocolBps = BigInt(protocolFeeBps)
        const protocolDenominator = 10_000n - protocolBps
        const expectedProtocolFeeAmount = (buyAfter * protocolBps) / protocolDenominator

        // Partner fee is based on beforeAllFees.buyAmount = buyAmount + networkCostInBuyCurrency + protocolFeeAmount
        const networkCostInBuyCurrency =
          (buyAfter * BigInt(orderParams.feeAmount)) / BigInt(orderParams.sellAmount)
        const buyBeforeAllFees = buyAfter + networkCostInBuyCurrency + expectedProtocolFeeAmount
        const partnerBps = BigInt(partnerFeeBps)
        const expectedPartnerFeeAmount = (buyBeforeAllFees * partnerBps) / 10_000n

        expect(result.costs.partnerFee.amount).toBe(expectedPartnerFeeAmount)
        // afterPartnerFees.buyAmount = afterNetworkCosts.buyAmount - partnerFeeAmount
        // afterNetworkCosts.buyAmount = buyAmount (raw API value)
        expect(result.afterPartnerFees.buyAmount).toBe(buyAfter - expectedPartnerFeeAmount)
      })

      it('SELL beforeAllFees includes protocol fee once', () => {
        const orderParams = SELL_ORDER

        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        // beforeAllFees.buyAmount = buyAmount + networkCostInBuyCurrency + protocolFeeAmount
        // beforeNetworkCosts.buyAmount = buyAmount + networkCostInBuyCurrency
        expect(result.beforeAllFees.buyAmount).toBe(
          result.beforeNetworkCosts.buyAmount + result.costs.protocolFee.amount,
        )
      })

      it('protocolFeeBps can be a decimal number', () => {
        const protocolFeeBps = 0.003
        const orderParams = SELL_ORDER

        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        const buyAfter = BigInt(orderParams.buyAmount)
        const bps = BigInt(protocolFeeBps * 100_000)
        const denominator = 10_000n * 100_000n - bps
        const expectedProtocolFeeAmount = (buyAfter * bps) / denominator

        expect(result.costs.protocolFee.amount).toBe(expectedProtocolFeeAmount)
        // beforeNetworkCosts.buyAmount = buyAmount + networkCostInBuyCurrency
        const networkCostInBuyCurrency =
          (buyAfter * BigInt(orderParams.feeAmount)) / BigInt(orderParams.sellAmount)
        expect(result.beforeNetworkCosts.buyAmount).toBe(buyAfter + networkCostInBuyCurrency)

        expect(result.costs.protocolFee).toEqual({
          amount: 5589n,
          bps: protocolFeeBps,
        })
      })
    })

    describe('Buy order', () => {
      it('calculates protocol fee from quote amounts', () => {
        const orderParams = BUY_ORDER
        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        const sellAmount = BigInt(orderParams.sellAmount)
        const feeAmount = BigInt(orderParams.feeAmount)
        const sellAfterNetwork = sellAmount + feeAmount

        const bps = BigInt(protocolFeeBps)
        const denominator = 10_000n + bps
        const expectedProtocolFeeAmount = (sellAfterNetwork * bps) / denominator

        expect(result.costs.protocolFee.amount).toBe(expectedProtocolFeeAmount)
        // beforeNetworkCosts.sellAmount for BUY = afterProtocolFees.sellAmount = sellAmount (raw API value)
        expect(result.beforeNetworkCosts.sellAmount).toBe(sellAmount)
      })

      it('calculates partner fee on top of amounts before protocol fee', () => {
        const orderParams = BUY_ORDER
        const partnerFeeBps = 100

        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps,
          protocolFeeBps,
        })

        const sellAmount = BigInt(orderParams.sellAmount)
        const feeAmount = BigInt(orderParams.feeAmount)
        const sellAfterNetwork = sellAmount + feeAmount

        const protocolBps = BigInt(protocolFeeBps)
        const protocolDenominator = 10_000n + protocolBps
        const expectedProtocolFeeAmount = (sellAfterNetwork * protocolBps) / protocolDenominator

        // beforeAllFees.sellAmount = sellAmount - protocolFeeAmount
        const sellBeforeAllFees = sellAmount - expectedProtocolFeeAmount

        const partnerBps = BigInt(partnerFeeBps)
        const expectedPartnerFeeAmount = (sellBeforeAllFees * partnerBps) / 10_000n

        expect(result.costs.partnerFee.amount).toBe(expectedPartnerFeeAmount)
        // afterPartnerFees.sellAmount = afterNetworkCosts.sellAmount + partnerFeeAmount
        // afterNetworkCosts.sellAmount = sellAmount + feeAmount
        expect(result.afterPartnerFees.sellAmount).toBe(sellAfterNetwork + expectedPartnerFeeAmount)
      })

      it('restores beforeAllFees.sellAmount with a single protocol fee deduction', () => {
        const orderParams = BUY_ORDER

        const result = getQuoteAmountsAndCosts({
          orderParams,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        // beforeAllFees.sellAmount = sellAmount - protocolFeeAmount
        // beforeNetworkCosts.sellAmount = sellAmount
        expect(result.beforeAllFees.sellAmount).toBe(
          result.beforeNetworkCosts.sellAmount - result.costs.protocolFee.amount,
        )
      })
    })

    it('protocolFeeBps can be a decimal number', () => {
      const protocolFeeBps = 0.00071

      const orderParams = BUY_ORDER
      const result = getQuoteAmountsAndCosts({
        orderParams,
        slippagePercentBps: 0,
        partnerFeeBps: undefined,
        protocolFeeBps,
      })

      const sellAmount = BigInt(orderParams.sellAmount)
      const feeAmount = BigInt(orderParams.feeAmount)
      const sellAfterNetwork = sellAmount + feeAmount

      const bps = BigInt(protocolFeeBps * 100_000)
      const denominator = 10_000n * 100_000n + bps
      const expectedProtocolFeeAmount = (sellAfterNetwork * bps) / denominator

      expect(result.costs.protocolFee.amount).toBe(expectedProtocolFeeAmount)
      // beforeNetworkCosts.sellAmount for BUY = sellAmount (raw API value)
      expect(result.beforeNetworkCosts.sellAmount).toBe(sellAmount)

      expect(result.costs.protocolFee).toEqual({
        amount: 12206189769n,
        bps: protocolFeeBps,
      })
    })
  })
})
