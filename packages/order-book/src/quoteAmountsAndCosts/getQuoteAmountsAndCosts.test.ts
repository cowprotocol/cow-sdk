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

const sellDecimals = 18
const buyDecimals = 6

/**
 * Since we have partner fees, now it's not clear what does it mean `feeAmount`?
 * To avoid confusion, we should consider this `feeAmount` as `networkCosts`
 *
 * Fee is always taken from sell token (for sell/buy orders):
 * 3855544038281082 + 156144455961718918 = 160000000000000000
 *
 * Again, to avoid confusion, we should take this `sellAmount` as `sellAmountBeforeNetworkCosts`
 * Hence, `buyAmount` is `buyAmountAfterNetworkCosts` because this amount is what you will get for the sell amount
 *
 * In this order we are selling 0.16 WETH for 1863 COW - network costs
 */
const SELL_ORDER: OrderParameters = {
  kind: OrderKind.SELL,
  sellAmount: '156144455961718918',
  feeAmount: '3855544038281082',
  buyAmount: '18632013982',
  ...otherFields,
}

/**
 * In this order we are buying 2000 COW for 1.6897 WETH + network costs
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
    describe.each(['sell', 'buy'])('%s order', (type: string) => {
      const orderParams = type === 'sell' ? SELL_ORDER : BUY_ORDER

      it('Sell amount after network costs should be sellAmount + feeAmount', () => {
        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps: undefined,
        })

        expect(result.afterNetworkCosts.sellAmount.toString()).toBe(
          String(BigInt(orderParams.sellAmount) + BigInt(orderParams.feeAmount)),
        )
      })

      it('Buy amount before network costs should be SellAmountAfterNetworkCosts * Price', () => {
        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps: undefined,
        })

        expect(result.beforeNetworkCosts.buyAmount.toString()).toBe(
          (
            (+orderParams.sellAmount + +orderParams.feeAmount) * // SellAmountAfterNetworkCosts
            (+orderParams.buyAmount / +orderParams.sellAmount)
          ) // Price
            .toFixed(),
        )
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
          sellDecimals,
          buyDecimals,
          partnerFeeBps,
          slippagePercentBps: 0,
          protocolFeeBps: undefined,
        })

        const buyAmountBeforeNetworkCosts =
          (+orderParams.sellAmount + +orderParams.feeAmount) * // SellAmountAfterNetworkCosts
          (+orderParams.buyAmount / +orderParams.sellAmount) // Price

        const partnerFeeAmount = Math.floor((buyAmountBeforeNetworkCosts * partnerFeeBps) / 100 / 100)

        expect(Number(result.costs.partnerFee.amount)).toBe(partnerFeeAmount)
      })
    })

    describe('Buy order', () => {
      it('Partner fee should be added on top of sell amount after network costs', () => {
        const orderParams = BUY_ORDER
        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          partnerFeeBps,
          slippagePercentBps: 0,
          protocolFeeBps: undefined,
        })

        const partnerFeeAmount = Math.floor((+orderParams.sellAmount * partnerFeeBps) / 100 / 100)

        expect(Number(result.costs.partnerFee.amount)).toBe(partnerFeeAmount)
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
          sellDecimals,
          buyDecimals,
          partnerFeeBps: undefined,
          slippagePercentBps,
          protocolFeeBps: undefined,
        })

        const buyAmountAfterNetworkCosts = +orderParams.buyAmount

        const slippageAmount = (buyAmountAfterNetworkCosts * slippagePercentBps) / 100 / 100

        expect(Number(result.afterSlippage.buyAmount)).toBe(Math.ceil(buyAmountAfterNetworkCosts - slippageAmount))
      })
    })

    describe('Buy order', () => {
      it('Slippage should be added on top of sell amount after partner costs', () => {
        const orderParams = BUY_ORDER
        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          partnerFeeBps: undefined,
          slippagePercentBps,
          protocolFeeBps: undefined,
        })

        const sellAmountAfterNetworkCosts = +orderParams.sellAmount + +orderParams.feeAmount
        const slippageAmount = (sellAmountAfterNetworkCosts * slippagePercentBps) / 100 / 100

        // We are loosing precision here, because of using numbers and we have to use toBeCloseTo()
        expect(Number(result.afterSlippage.sellAmount)).toBeCloseTo(sellAmountAfterNetworkCosts + slippageAmount, -2)
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
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        const buyAfter = BigInt(orderParams.buyAmount)
        const bps = BigInt(protocolFeeBps)
        const denominator = 10_000n - bps
        const expectedProtocolFeeAmount = (buyAfter * bps) / denominator
        const expectedBuyBeforeProtocol = buyAfter + expectedProtocolFeeAmount

        expect(result.costs.protocolFee.amount.toString()).toBe(expectedProtocolFeeAmount.toString())
        expect(result.beforeNetworkCosts.buyAmount.toString()).toBe(expectedBuyBeforeProtocol.toString())
      })

      it('calculates partner fee on top of amounts before protocol fee', () => {
        const orderParams = SELL_ORDER
        const partnerFeeBps = 100

        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps,
          protocolFeeBps,
        })

        const buyAfter = BigInt(orderParams.buyAmount)
        const protocolBps = BigInt(protocolFeeBps)
        const protocolDenominator = 10_000n - protocolBps
        const expectedProtocolFeeAmount = (buyAfter * protocolBps) / protocolDenominator
        const buyBeforeProtocol = buyAfter + expectedProtocolFeeAmount

        const partnerBps = BigInt(partnerFeeBps)
        const expectedPartnerFeeAmount = (buyBeforeProtocol * partnerBps) / 10_000n

        expect(result.costs.partnerFee.amount.toString()).toBe(expectedPartnerFeeAmount.toString())
        expect(result.afterPartnerFees.buyAmount.toString()).toBe((buyAfter - expectedPartnerFeeAmount).toString())
      })

      it('SELL beforeAllFees includes protocol fee once', () => {
        const orderParams = SELL_ORDER

        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        const expectedBeforeAllFeesBuyAmount =
          result.afterNetworkCosts.buyAmount +
          result.costs.protocolFee.amount +
          result.costs.networkFee.amountInBuyCurrency

        expect(result.beforeAllFees.buyAmount).toBe(expectedBeforeAllFeesBuyAmount)
      })

      it('protocolFeeBps can be a decimal number', () => {
        const protocolFeeBps = 0.003
        const orderParams = SELL_ORDER

        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        const buyAfter = BigInt(orderParams.buyAmount)
        const bps = BigInt(protocolFeeBps * 100_000)
        const denominator = 10_000n * 100_000n - bps
        const expectedProtocolFeeAmount = (buyAfter * bps) / denominator
        const expectedBuyBeforeProtocol = buyAfter + expectedProtocolFeeAmount

        expect(result.costs.protocolFee.amount.toString()).toBe(expectedProtocolFeeAmount.toString())
        expect(result.beforeNetworkCosts.buyAmount.toString()).toBe(expectedBuyBeforeProtocol.toString())

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
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        const sellBefore = BigInt(orderParams.sellAmount)
        const network = BigInt(orderParams.feeAmount)
        const sellAfter = sellBefore + network

        const bps = BigInt(protocolFeeBps)
        const denominator = 10_000n + bps
        const expectedProtocolFeeAmount = (sellAfter * bps) / denominator
        const expectedSellBeforeProtocol = sellAfter - expectedProtocolFeeAmount

        expect(result.costs.protocolFee.amount.toString()).toBe(expectedProtocolFeeAmount.toString())
        expect(result.beforeNetworkCosts.sellAmount.toString()).toBe(expectedSellBeforeProtocol.toString())
      })

      it('calculates partner fee on top of amounts before protocol fee', () => {
        const orderParams = BUY_ORDER
        const partnerFeeBps = 100

        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps,
          protocolFeeBps,
        })

        const sellBefore = BigInt(orderParams.sellAmount)
        const network = BigInt(orderParams.feeAmount)
        const sellAfter = sellBefore + network

        const protocolBps = BigInt(protocolFeeBps)
        const protocolDenominator = 10_000n + protocolBps
        const expectedProtocolFeeAmount = (sellAfter * protocolBps) / protocolDenominator
        const sellBeforeProtocol = sellAfter - expectedProtocolFeeAmount

        const partnerBps = BigInt(partnerFeeBps)
        const expectedPartnerFeeAmount = (sellBeforeProtocol * partnerBps) / 10_000n

        expect(result.costs.partnerFee.amount.toString()).toBe(expectedPartnerFeeAmount.toString())
        expect(result.afterPartnerFees.sellAmount.toString()).toBe((sellAfter + expectedPartnerFeeAmount).toString())
      })

      it('restores beforeAllFees.sellAmount with a single protocol fee deduction', () => {
        const orderParams = BUY_ORDER

        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
          protocolFeeBps,
        })

        const expectedBeforeAllFeesSellAmount =
          result.afterNetworkCosts.sellAmount -
          result.costs.protocolFee.amount -
          result.costs.networkFee.amountInSellCurrency

        expect(result.beforeAllFees.sellAmount).toBe(expectedBeforeAllFeesSellAmount)
      })
    })

    it('protocolFeeBps can be a decimal number', () => {
      const protocolFeeBps = 0.00071

      const orderParams = BUY_ORDER
      const result = getQuoteAmountsAndCosts({
        orderParams,
        sellDecimals,
        buyDecimals,
        slippagePercentBps: 0,
        partnerFeeBps: undefined,
        protocolFeeBps,
      })

      const sellBefore = BigInt(orderParams.sellAmount)
      const network = BigInt(orderParams.feeAmount)
      const sellAfter = sellBefore + network

      const bps = BigInt(protocolFeeBps * 100_000)
      const denominator = 10_000n * 100_000n + bps
      const expectedProtocolFeeAmount = (sellAfter * bps) / denominator
      const expectedSellBeforeProtocol = sellAfter - expectedProtocolFeeAmount

      expect(result.costs.protocolFee.amount.toString()).toBe(expectedProtocolFeeAmount.toString())
      expect(result.beforeNetworkCosts.sellAmount.toString()).toBe(expectedSellBeforeProtocol.toString())

      expect(result.costs.protocolFee).toEqual({
        amount: 12206189769n,
        bps: protocolFeeBps,
      })
    })
  })
})
