import { Order } from './generated'

/**
 * An order with the total fee added.
 */
export interface EnrichedOrder extends Order {
  totalFee: string
}

/**
 * CoW Protocol quote has amounts (sell/buy) and costs (network fee), there is also partner fees.
 * Besides that, CoW Protocol supports both sell and buy orders and the fees and costs are calculated differently.
 *
 * The order of adding fees and costs is as follows:
 * 1. Network fee is always added to the sell amount
 * 2. Partner fee is added to the surplus amount (sell amount for sell-orders, buy amount for buy-orders)
 *
 * For sell-orders the partner fee is subtracted from the buy amount after network costs.
 * For buy-orders the partner fee is added on top of the sell amount after network costs.
 */
export interface QuoteAmountsAndCosts<
  AmountType = bigint,
  Amounts = {
    sellAmount: AmountType
    buyAmount: AmountType
  }
> {
  isSell: boolean

  costs: {
    networkFee: {
      amountInSellCurrency: AmountType
      amountInBuyCurrency: AmountType
    }
    partnerFee: {
      amount: AmountType
      bps: number
    }
  }

  beforeNetworkCosts: Amounts
  afterNetworkCosts: Amounts
  afterPartnerFees: Amounts
  afterSlippage: Amounts
}
