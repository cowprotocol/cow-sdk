import { LimitOrderParameters, SwapParameters } from './types'
import { OrderQuoteResponse } from '../order-book'

export function swapParamsToLimitOrderParams(
  params: SwapParameters,
  { quote: { sellAmount, buyAmount } }: OrderQuoteResponse
): LimitOrderParameters {
  return { ...params, sellAmount, buyAmount }
}
