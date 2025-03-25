/* eslint-disable @typescript-eslint/no-unused-vars */
import { log } from '../../common/utils/log'
import { QuoteAndPost, SwapAdvancedSettings, TradeParameters, TradingSdk, WithPartialTraderParams } from '../../trading'
import { QuoteBridgeRequest } from '../types'

export function getQuoteWithoutBridge(params: {
  quoteBridgeRequest: QuoteBridgeRequest
  advancedSettings?: SwapAdvancedSettings
  tradingSdk: TradingSdk
}): Promise<QuoteAndPost> {
  const { quoteBridgeRequest, advancedSettings, tradingSdk } = params
  const { sellTokenAddress, buyTokenAddress, amount, ...rest } = quoteBridgeRequest
  const swapParams: WithPartialTraderParams<TradeParameters> = {
    ...rest,
    chainId: quoteBridgeRequest.sellTokenChainId,
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    amount: amount.toString(),
  }

  log(`Single-chain swap: Delegate to trading SDK`)
  return tradingSdk.getQuote(swapParams, advancedSettings)
}
