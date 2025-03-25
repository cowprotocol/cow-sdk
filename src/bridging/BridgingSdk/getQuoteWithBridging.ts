import { latest } from '@cowprotocol/app-data'
import { MetadataApi } from '@cowprotocol/app-data'
import { getHookMockForCostEstimation } from '../../hooks/utils'
import {
  generateAppDataFromDoc,
  postSwapOrderFromQuote,
  QuoteResults,
  SwapAdvancedSettings,
  TradeParameters,
  TradingSdk,
  WithPartialTraderParams,
} from '../../trading'
import {
  BridgeHook,
  BridgeProvider,
  BridgeQuoteAndPost,
  BridgeQuoteResult,
  BridgeQuoteResults,
  GetErc20Decimals,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from '../types'
import { Signer } from '@ethersproject/abstract-signer'
import { getSigner } from '../../common/utils/wallet'

type GetQuoteWithBridgeParams<T extends BridgeQuoteResult> = {
  /**
   * Overall request for the swap and the bridge.
   */
  swapAndBridgeRequest: QuoteBridgeRequest

  /**
   * Advanced settings for the swap.
   */
  advancedSettings?: SwapAdvancedSettings

  /**
   * Provider for the bridge.
   */
  provider: BridgeProvider<T>

  /**
   * Trading SDK.
   */
  tradingSdk: TradingSdk

  /**
   * Function to get the decimals of the ERC20 tokens.
   */
  getErc20Decimals: GetErc20Decimals
}

export async function getQuoteWithBridge<T extends BridgeQuoteResult>(
  params: GetQuoteWithBridgeParams<T>
): Promise<BridgeQuoteAndPost> {
  const { provider, swapAndBridgeRequest, advancedSettings, getErc20Decimals, tradingSdk } = params
  const { sellTokenChainId, sellTokenAddress, amount, signer: signerLike, ...rest } = swapAndBridgeRequest
  const signer = getSigner(signerLike)

  // Get the mocked hook (for estimating the additional swap costs)
  const bridgeRequestWithoutAmount = await getBaseBridgeQuoteRequest({
    swapAndBridgeRequest: swapAndBridgeRequest,
    provider,
    getErc20Decimals,
  })

  // Get the hook mock for cost estimation
  const gasLimit = provider.getGasLimitEstimationForHook(bridgeRequestWithoutAmount)
  const mockedHook = getHookMockForCostEstimation(gasLimit)

  const { sellTokenAddress: intermediateToken, sellTokenDecimals: intermediaryTokenDecimals } =
    bridgeRequestWithoutAmount

  // Estimate the expected amount of intermediate tokens received in CoW Protocol's swap
  const swapParams: WithPartialTraderParams<TradeParameters> = {
    ...rest,
    chainId: sellTokenChainId,
    sellToken: sellTokenAddress,
    buyToken: intermediateToken,
    buyTokenDecimals: intermediaryTokenDecimals,
    amount: amount.toString(),
    signer,
  }
  const { result: swapResult, orderBookApi } = await tradingSdk.getQuoteResults(swapParams, {
    ...advancedSettings,
    appData: {
      metadata: {
        hooks: mockedHook,
      },
    },
  })
  const intermediateTokenAmount = swapResult.amountsAndCosts.afterSlippage.buyAmount // Estimated, as it will likely have surplus

  // Get the bridge result

  const { bridgeResult, bridgeHook, appData } = await getBridgeResult({
    swapAndBridgeRequest,
    swapResult,
    bridgeRequestWithoutAmount,
    provider,
    intermediateTokenAmount,
    signer,
  })

  // Update the receiver and appData (both were mocked before we had the bridge hook)
  swapResult.tradeParameters.receiver = bridgeHook.recipient
  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(appData)
  swapResult.appDataInfo = {
    fullAppData,
    appDataKeccak256,
    doc: appData,
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

/**
 * Ge the base params (without the amount) for the bridge quote request
 */
async function getBaseBridgeQuoteRequest<T extends BridgeQuoteResult>(params: {
  swapAndBridgeRequest: QuoteBridgeRequest
  provider: BridgeProvider<T>
  getErc20Decimals: GetErc20Decimals
}): Promise<QuoteBridgeRequestWithoutAmount> {
  const { provider, getErc20Decimals, swapAndBridgeRequest: quoteBridgeRequest } = params
  const { sellTokenChainId } = quoteBridgeRequest

  const intermediateTokens = await provider.getIntermediateTokens(quoteBridgeRequest)

  if (intermediateTokens.length === 0) {
    throw new Error('No path found')
  }

  // We just pick the first intermediate token for now
  const intermediateTokenAddress = intermediateTokens[0]

  // Get intermediate token decimals
  const intermediaryTokenDecimals = await getErc20Decimals(sellTokenChainId, intermediateTokenAddress)

  // Get the gas limit estimation for the hook
  const bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount = {
    ...quoteBridgeRequest,
    sellTokenAddress: intermediateTokenAddress,
    sellTokenDecimals: intermediaryTokenDecimals,
  }

  return bridgeRequestWithoutAmount
}

interface GetBridgeResultResult {
  bridgeResult: BridgeQuoteResults
  bridgeHook: BridgeHook
  appData: latest.AppDataRootSchema
}

async function getBridgeResult(params: {
  swapAndBridgeRequest: QuoteBridgeRequest
  swapResult: QuoteResults
  intermediateTokenAmount: bigint
  bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
  provider: BridgeProvider<BridgeQuoteResult>
  signer: Signer
}): Promise<GetBridgeResultResult> {
  const {
    swapResult,
    bridgeRequestWithoutAmount,
    provider,
    swapAndBridgeRequest: overallBridgeRequest,
    intermediateTokenAmount,
    signer,
  } = params

  const bridgeRequest: QuoteBridgeRequest = {
    ...bridgeRequestWithoutAmount,
    amount: intermediateTokenAmount,
  }

  // Get the quote for the bridging of the intermediate token to the final token
  const bridgingQuote = await provider.getQuote(bridgeRequest)

  // Get the bridging call
  const unsignedBridgeCall = await provider.getUnsignedBridgeCall(overallBridgeRequest, bridgingQuote)

  // Get the pre-authorized hook
  const bridgeHook = await provider.getSignedHook(overallBridgeRequest.sellTokenChainId, unsignedBridgeCall, signer)

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
    tradeParameters: bridgeRequest, // Just the bridge (not the swap & bridge)
    bridgeCallDetails: {
      unsignedBridgeCall: unsignedBridgeCall,
      preAuthorizedBridgingHook: bridgeHook,
    },
  }

  return { bridgeResult, bridgeHook, appData }
}
