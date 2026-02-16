import type { OrderParameters } from '../generated'

export type OrderAmountsBig = { sellAmount: bigint; buyAmount: bigint }

export type BigNumber = {
  big: bigint
  num: number
}

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

export interface QuoteAmountsWithNetworkCosts {
  isSell: boolean
  quotePrice: number
  networkCostAmount: BigNumber
  sellAmountBeforeNetworkCosts: BigNumber
  buyAmountAfterNetworkCosts: BigNumber
  sellAmountAfterNetworkCosts: BigNumber
  buyAmountBeforeNetworkCosts: BigNumber
}
