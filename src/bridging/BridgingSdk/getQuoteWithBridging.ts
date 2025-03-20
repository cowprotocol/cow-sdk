import { MetadataApi } from '@cowprotocol/app-data'
import { getHookMockForCostEstimation } from '../../hooks/utils'
import { postSwapOrderFromQuote, SwapAdvancedSettings, TradeParameters, TradingSdk } from '../../trading'
import {
  BridgeProvider,
  BridgeQuoteAndPost,
  BridgeQuoteResult,
  BridgeQuoteResults,
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
}): Promise<BridgeQuoteAndPost> {
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
  const { result: swapResult, orderBookApi } = await tradingSdk.getQuoteResults(swapParams, {
    ...advancedSettings,
    appData: {
      metadata: {
        hooks: hookMock,
      },
    },
  })
  const intermediateTokenAmount = swapResult.amountsAndCosts.afterSlippage.buyAmount // Estimated, as

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
    ...swapResult.appDataInfo.doc,
    metadata: {
      hooks: {
        post: [bridgeHook.postHook],
      },
    },
  })

  // Prepare the bridge result
  const bridgeResult: BridgeQuoteResults = {
    ...bridgingQuote,
    providerInfo: provider.info,
    intermediateTokenAddress: intermediateTokenAddress,
    unsignedBridgeCall: unsignedBridgeCall,
    preAuthorizedBridgingHook: bridgeHook,
    quoteResponse: bridgingQuote,
  }

  // Return the quote results with the post swap order function
  return {
    swap: swapResult,
    bridge: bridgeResult,
    async postSwapOrderFromQuote() {
      const quoteResults = {
        result: {
          ...swapResult,
          signer,
        },
        orderBookApi,
      }

      return postSwapOrderFromQuote(quoteResults, { ...advancedSettings, appData })
    },
  }
}
