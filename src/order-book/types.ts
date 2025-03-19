import { Order } from './generated'

/**
 * An order with the total fee added.
 */
export interface EnrichedOrder extends Order {
  totalFee: string
}

export interface Amounts<T> {
  sellAmount: T
  buyAmount: T
}

export interface Costs<T> {
  networkFee: {
    amountInSellCurrency: Amounts<T>
    amountInBuyCurrency: Amounts<T>
  }
  partnerFee: {
    amount: Amounts<T>
    bps: number
  }
}

/**
 * Details about costs and amounts, costs and fees of a quote.
 *
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
export interface QuoteAmountsAndCosts<T = bigint> {
  isSell: boolean
  costs: Costs<T>
  beforeNetworkCosts: Amounts<T>
  afterNetworkCosts: Amounts<T>
  afterPartnerFees: Amounts<T>
  afterSlippage: Amounts<T>
}
