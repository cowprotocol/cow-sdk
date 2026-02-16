import type { OrderParameters } from '../generated'

export type OrderAmountsBig = { sellAmount: bigint; buyAmount: bigint }

export type BigNumber = {
  big: bigint
  num: number
}

export interface QuoteParameters {
  isSell: boolean
  sellDecimals: number
  buyDecimals: number
  orderParams: OrderParameters
  protocolFeeAmount: BigNumber
}

export interface QuoteAmountsAndCostsParams {
  sellDecimals: number
  buyDecimals: number
  orderParams: OrderParameters
  slippagePercentBps: number
  protocolFeeBps: number | undefined
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
