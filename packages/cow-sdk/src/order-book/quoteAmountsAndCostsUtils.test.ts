import { OrderParameters, OrderKind, SigningScheme, BuyTokenDestination, SellTokenSource } from './generated'
import { getQuoteAmountsAndCosts } from './quoteAmountsAndCostsUtils'

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
        })

        expect(result.afterNetworkCosts.sellAmount.toString()).toBe(
          String(BigInt(orderParams.sellAmount) + BigInt(orderParams.feeAmount))
        )
      })

      it('Buy amount before network costs should be SellAmountAfterNetworkCosts * Price', () => {
        const result = getQuoteAmountsAndCosts({
          orderParams,
          sellDecimals,
          buyDecimals,
          slippagePercentBps: 0,
          partnerFeeBps: undefined,
        })

        expect(result.beforeNetworkCosts.buyAmount.toString()).toBe(
          (
            (+orderParams.sellAmount + +orderParams.feeAmount) * // SellAmountAfterNetworkCosts
            (+orderParams.buyAmount / +orderParams.sellAmount)
          ) // Price
            .toFixed()
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
        })

        const sellAmountAfterNetworkCosts = +orderParams.sellAmount + +orderParams.feeAmount
        const slippageAmount = (sellAmountAfterNetworkCosts * slippagePercentBps) / 100 / 100

        // We are loosing precision here, because of using numbers and we have to use toBeCloseTo()
        expect(Number(result.afterSlippage.sellAmount)).toBeCloseTo(sellAmountAfterNetworkCosts + slippageAmount, -2)
      })
    })
  })
})
