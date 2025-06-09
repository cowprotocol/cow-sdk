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
    amountInSellCurrency: T
    amountInBuyCurrency: T
  }
  partnerFee: {
    amount: T
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
  /**
   * Whether the quote is a sell or buy order.
   */
  isSell: boolean

  /**
   * Estimated costs of settling the order.
   *
   * Costs are only payed if the order is executed. They cover the concept of gas costs to pay the solver for settling
   * your order onchain for you.
   *
   * They are payed in the sell token although for convenience, the costs data includes also the buy token
   * so UIs can decide how to show it to the user.
   */
  costs: Costs<T>

  /**
   * Amounts before network costs. This amount could be shown to the user to reflect how much they are expected to get
   * before applying any costs or fees (if costs and fees are displayed separately).
   */
  beforeNetworkCosts: Amounts<T>

  /**
   * Amounts after including network costs.
   */
  afterNetworkCosts: Amounts<T>

  /**
   * Amounts after including partner fees (if any).
   *
   * This amount could be shown to the user, as the expected to receive amount already including any fees or costs.
   */
  afterPartnerFees: Amounts<T>

  /**
   * Amounts after including the slippage tolerance.
   *
   * This is the minimum that the user will receive and the amount they will sign.
   *
   * It already accounts for all costs, fees and some slippage tolerance so they can execute the order even in the
   * event of the buy token appreciating.
   */
  afterSlippage: Amounts<T>
}
