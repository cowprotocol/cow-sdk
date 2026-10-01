import type { OrderKind, OrderParameters } from '../generated'

export type OrderAmountsBig = { sellAmount: bigint; buyAmount: bigint }

/**
 * The quoted amounts the fee math reads, and nothing else. Narrower than `OrderParameters` so the
 * Solana order book's quote fits too: it answers the same amounts under its own generated types.
 * `kind` widens to the enum's values rather than the enum, which the two order books declare apart.
 */
export type QuoteAmountsSource = Pick<OrderParameters, 'sellAmount' | 'buyAmount' | 'feeAmount'> & {
  kind: `${OrderKind}`
}

export interface QuoteParameters {
  sellDecimals: number
  buyDecimals: number
  orderParams: QuoteAmountsSource
  protocolFeeBps: number | undefined
}

export interface QuoteAmountsAndCostsParams {
  orderParams: QuoteAmountsSource
  protocolFeeBps: number | undefined
  partnerFeeBps: number | undefined
  slippagePercentBps: number
}

export interface QuotePriceParams {
  numerator: bigint
  denominator: bigint
}

export interface QuoteAmountsWithNetworkCosts {
  isSell: boolean
  quotePriceParams: QuotePriceParams
  networkCostAmount: bigint
  sellAmountBeforeNetworkCosts: bigint
  buyAmountAfterNetworkCosts: bigint
  sellAmountAfterNetworkCosts: bigint
  buyAmountBeforeNetworkCosts: bigint
}
