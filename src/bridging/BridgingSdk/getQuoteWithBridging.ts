import { MetadataApi } from '@cowprotocol/app-data'
import { getHookMockForCostEstimation } from '../../hooks/utils'
import { QuoteAndPost, SwapAdvancedSettings, TradeParameters, TradingSdk } from '../../trading'
import {
  BridgeProvider,
  BridgeQuoteResult,
  GetErc20Decimals,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from '../types'
import { getSigner } from '../../common/utils/wallet'

export async function getQuoteWithBridge<T extends BridgeQuoteResult>(params: {
  quoteBridgeRequest: QuoteBridgeRequest
  advancedSettings?: SwapAdvancedSettings
  provider: BridgeProvider<T>
  tradingSdk: TradingSdk
  getErc20Decimals: GetErc20Decimals
}): Promise<QuoteAndPost> {
  const { provider, tradingSdk, getErc20Decimals, quoteBridgeRequest, advancedSettings } = params
  const { sellTokenChainId, sellTokenAddress, amount, signer: signerLike, ...rest } = quoteBridgeRequest

  const intermediateTokens = await provider.getIntermediateTokens(quoteBridgeRequest)

  if (intermediateTokens.length === 0) {
    throw new Error('No path found')
  }

  // We just pick the first intermediate token for now
  const intermediateTokenAddress = intermediateTokens[0]

  // Get intermediate token decimals
  const intermediaryTokenDecimals = await getErc20Decimals(sellTokenChainId, intermediateTokenAddress)

  // Get the gas limit estimation for the hook
  const bridgeQuoteRequestWithoutAmount: QuoteBridgeRequestWithoutAmount = {
    ...quoteBridgeRequest,
    sellTokenAddress: intermediateTokenAddress,
    sellTokenDecimals: intermediaryTokenDecimals,
  }
  const gasLimit = provider.getGasLimitEstimationForHook(bridgeQuoteRequestWithoutAmount)

  // Get the hook mock for cost estimation
  const hookMock = getHookMockForCostEstimation(gasLimit)

  // Estimate the expected amount of intermediate tokens we receive in CoW Protocol
  const swapParams: TradeParameters = {
    ...rest,
    sellToken: sellTokenAddress,
    buyToken: intermediateTokenAddress,
    buyTokenDecimals: intermediaryTokenDecimals,
    amount: amount.toString(),
  }
  const swapQuote = await tradingSdk.getQuoteResults(swapParams, {
    ...advancedSettings,
    appData: {
      metadata: {
        hooks: hookMock,
      },
    },
  })
  const intermediateTokenAmount = swapQuote.amountsAndCosts.afterSlippage.buyAmount // Estimated, as

  // Get the quote for the bridging of the intermediate token to the final token
  const bridgingQuote = await provider.getQuote({
    ...bridgeQuoteRequestWithoutAmount,
    amount: intermediateTokenAmount,
  })

  // Get the bridging call
  const unsignedBridgeCall = await provider.getUnsignedBridgeCall(quoteBridgeRequest, bridgingQuote)

  // Get the pre-authorized hook
  const signer = getSigner(signerLike)
  const bridgeHook = await provider.getSignedHook(quoteBridgeRequest.sellTokenChainId, unsignedBridgeCall, signer)

  // Update the receiver required by the hook (cow-shed)
  swapParams.receiver = bridgeHook.recipient

  // Generate the app data for the hook
  const metadataApi = new MetadataApi()
  const appData = await metadataApi.generateAppDataDoc({
    ...swapQuote.appDataInfo.doc,
    metadata: {
      hooks: {
        post: [bridgeHook.postHook],
      },
    },
  })

  // Return the quote and the postSwapOrderFromQuote method to post the cross-chain order
  return tradingSdk.getQuote(swapParams, { appData })

  // TODO: Review for final implementation. Its possible we don't want to do the second quote if we trust the first estimation, we can re-use it and calculate create the postSwapOrderFromQuote method
  // TODO: The swap amounts in the quote result referrs to the intermediate tokens. I still didn't think in this enough, but very likely we will want to return the cross-chain information and we need to change the return type
  // TODO: Uncomment the following code if we want to re-use the quote.
  //   const overallQuoteResults = toQuoteResultsFromQuotes({
  //     quoteBridgeRequest: quoteBridgeRequest,
  //     bridgeQuote: bridgingQuote,
  //     swapQuote: swapQuote,
  //     bridgeHook: bridgeHook,
  //   })

  //   return {
  //     quoteResults: overallQuoteResults,
  //     postSwapOrderFromQuote: () => {
  //       postSwapOrderFromQuote({
  //         ...overallQuoteResults,
  //         result: {
  //           signer,
  //           // quoteResults: overallQuoteResults,
  //           orderBookApi,
  //           tradeParameters: getTradeParametersAfterQuote({
  //             quoteParameters: overallQuoteResults.tradeParameters,
  //             orderParameters: swapParams,
  //           }),
  //         },
  //       })
  //     },
  //   }
}

// function toQuoteResultsFromQuotes(quoteResults: {
//   quoteBridgeRequest: QuoteBridgeRequest
//   bridgeQuote: BridgeQuoteResult
//   swapQuote: QuoteResults
//   bridgeHook: BridgeHook
// }): QuoteResults {
//   const { quoteBridgeRequest, bridgeQuote, swapQuote, bridgeHook } = quoteResults

//   // TODO: Use hook in appData!

//   return {
//     amountsAndCosts: {
//       sellAmount: quoteBridgeRequest.amount,
//       buyAmount: bridgeQuote.buyAmount,
//       afterSlippage: {
//         sellAmount: quoteBridgeRequest.amount,
//         buyAmount: bridgeQuote.buyAmount,
//       },
//       // Include other costs from intermediate and final quotes as needed
//     },
//     appDataInfo: swapQuote.appDataInfo,
//     tradeParameters: quoteBridgeRequest,
//     orderToSign: swapQuote.orderToSign,
//     quoteResponse: swapQuote.quoteResponse,
//     orderTypedData: swapQuote.orderTypedData,
//   }
// }
