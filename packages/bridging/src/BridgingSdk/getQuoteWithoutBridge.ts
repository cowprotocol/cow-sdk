import { jsonWithBigintReplacer, log } from '@cowprotocol/sdk-common'
import {
  QuoteAndPost,
  SwapAdvancedSettings,
  TradeParameters,
  TradingSdk,
  WithPartialTraderParams,
} from '@cowprotocol/sdk-trading'
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

  // Signer cannot be stringified
  const { signer: _, ...paramsToLog } = swapParams

  log(`Single-chain swap: Delegate to trading SDK with params ${JSON.stringify(paramsToLog, jsonWithBigintReplacer)}`)
  return tradingSdk.getQuote(swapParams, advancedSettings)
}
