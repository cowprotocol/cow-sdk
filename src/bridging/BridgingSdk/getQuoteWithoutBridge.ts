/* eslint-disable @typescript-eslint/no-unused-vars */
import { QuoteAndPost, SwapAdvancedSettings, TradeParameters, TradingSdk } from '../../trading'
import { QuoteBridgeRequest } from '../types'

export function getQuoteWithoutBridge(params: {
  tradingSdk: TradingSdk
  quoteBridgeRequest: QuoteBridgeRequest
  advancedSettings?: SwapAdvancedSettings
}): Promise<QuoteAndPost> {
  const { quoteBridgeRequest, advancedSettings, tradingSdk } = params
  const { sellTokenAddress, buyTokenAddress, amount, ...rest } = quoteBridgeRequest
  const swapParams: TradeParameters = {
    ...rest,
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    amount: amount.toString(),
  }

  return tradingSdk.getQuote(swapParams, advancedSettings)
}
