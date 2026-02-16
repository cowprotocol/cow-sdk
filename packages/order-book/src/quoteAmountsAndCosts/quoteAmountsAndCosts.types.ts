import type { OrderParameters } from '../generated'

export type OrderAmountsBig = { sellAmount: bigint; buyAmount: bigint }

export interface QuoteParameters {
  sellDecimals: number
  buyDecimals: number
  orderParams: OrderParameters
  protocolFeeBps: number | undefined
}

export interface QuoteAmountsAndCostsParams extends QuoteParameters {
  slippagePercentBps: number
  partnerFeeBps: number | undefined
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
