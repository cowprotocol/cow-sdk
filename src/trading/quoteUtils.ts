import { getOrderToSign } from './getOrderToSign'
import { GetQuoteResult } from './getQuote'
import { LimitOrderParameters, SwapParameters } from './types'
import { UnsignedOrder } from '../order-signing'
import { OrderQuoteResponse } from '../order-book'

export function swapParamsToLimitOrderParams(
  params: SwapParameters,
  { quote: { sellAmount, buyAmount, feeAmount } }: OrderQuoteResponse
): LimitOrderParameters {
  return { ...params, sellAmount, buyAmount, networkCostsAmount: feeAmount }
}

export async function getOrderToSignFromQuoteResult(
  quoteResult: GetQuoteResult,
  params: SwapParameters
): Promise<UnsignedOrder> {
  const { signer, appDataInfo } = quoteResult
  const from = await signer.getAddress()
  const order = swapParamsToLimitOrderParams(params, quoteResult.quoteResponse)

  return getOrderToSign(from, order, appDataInfo)
}
