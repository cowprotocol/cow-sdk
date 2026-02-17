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
  protocolFee: {
    amount: T
    bps: number
  }
}

/**
 * The most important thing with the quote amounts is the order of applying fees and costs:
 * 1. Protocol fee
 * 2. Network costs
 * 3. Partner fee
 * 4. Slippage
 *
 * This order implies another important thing, what is "before" and "after"?
 * For SELL orders:
 *  - original spot price SELL AMOUNT is the highest value which reduces after adding network costs
 *  - original spot price BUY AMOUNT is the highest value which reduces after adding all the fees
 * For BUY orders:
 *  - original spot price SELL AMOUNT is the lowest value which increases after adding network costs and fees
 *  - original spot price BUY AMOUNT is constant, it doesn't change
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
   * Before all the fees and costs. Spot price amounts
   */
  beforeAllFees: Amounts<T>

  /**
   * Amounts before network costs. This amount could be shown to the user to reflect how much they are expected to get
   * before applying any costs or fees (if costs and fees are displayed separately).
   */
  beforeNetworkCosts: Amounts<T>

  /**
   * 1. Same with beforeNetworkCosts.
   * `beforeNetworkCosts` was here even before protocol fee existed, and we keep it for backward compatibility
   */
  afterProtocolFees: Amounts<T>

  /**
   * 2. Amounts after including network costs.
   */
  afterNetworkCosts: Amounts<T>

  /**
   * 3. Amounts after including partner fees (if any).
   *
   * This amount could be shown to the user, as the expected to receive amount already including any fees or costs.
   */
  afterPartnerFees: Amounts<T>

  /**
   * 4. Amounts after including the slippage tolerance.
   *
   * This is the minimum that the user will receive and the amount they will sign.
   *
   * It already accounts for all costs, fees and some slippage tolerance so they can execute the order even in the
   * event of the buy token appreciating.
   */
  afterSlippage: Amounts<T>

  /**
   * Amounts that supposed to be signed as part of order
   */
  amountsToSign: Amounts<T>
}
