import { LimitOrderParameters, SwapParameters } from './types'
import { OrderQuoteResponse } from '../order-book'

export function swapParamsToLimitOrderParams(
  params: SwapParameters,
  { quote: { sellAmount, buyAmount, feeAmount } }: OrderQuoteResponse
): LimitOrderParameters {
  return { ...params, sellAmount, buyAmount, networkCostsAmount: feeAmount }
}
