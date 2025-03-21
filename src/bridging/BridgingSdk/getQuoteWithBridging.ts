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

export async function getQuoteWithBridge<T extends BridgeQuoteResult>(params: {
  quoteBridgeRequest: QuoteBridgeRequest
  advancedSettings?: SwapAdvancedSettings
  provider: BridgeProvider<T>
  tradingSdk: TradingSdk
  getErc20Decimals: GetErc20Decimals
}): Promise<BridgeQuoteAndPost> {
  const { provider, quoteBridgeRequest, advancedSettings, getErc20Decimals, tradingSdk } = params
  const { sellTokenAddress, amount, signer: signerLike, ...rest } = quoteBridgeRequest

  // Get the mocked hook (for estimating the additional swap costs)
  const bridgeQuoteRequestWithoutAmount = await getBaseBridgeQuoteRequest({
    quoteBridgeRequest,
    provider,
    getErc20Decimals,
  })

  // Get the hook mock for cost estimation
  const gasLimit = provider.getGasLimitEstimationForHook(bridgeQuoteRequestWithoutAmount)
  const mockedHook = getHookMockForCostEstimation(gasLimit)

  const { sellTokenAddress: intermediateToken, sellTokenDecimals: intermediaryTokenDecimals } =
    bridgeQuoteRequestWithoutAmount

  // Estimate the expected amount of intermediate tokens received in CoW Protocol's swap
  const swapParams: TradeParameters = {
    ...rest,
    sellToken: sellTokenAddress,
    buyToken: intermediateToken,
    buyTokenDecimals: intermediaryTokenDecimals,
    amount: amount.toString(),
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
  const signer = getSigner(signerLike)
  const { bridgeResult, bridgeHook, appData } = await getBridgeResult({
    quoteBridgeRequest,
    swapResult,
    bridgeQuoteRequestWithoutAmount,
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
  quoteBridgeRequest: QuoteBridgeRequest
  provider: BridgeProvider<T>
  getErc20Decimals: GetErc20Decimals
}): Promise<QuoteBridgeRequestWithoutAmount> {
  const { provider, getErc20Decimals, quoteBridgeRequest } = params
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
  const bridgeQuoteRequestWithoutAmount: QuoteBridgeRequestWithoutAmount = {
    ...quoteBridgeRequest,
    sellTokenAddress: intermediateTokenAddress,
    sellTokenDecimals: intermediaryTokenDecimals,
  }

  return bridgeQuoteRequestWithoutAmount
}

interface GetBridgeResultResult {
  bridgeResult: BridgeQuoteResults
  bridgeHook: BridgeHook
  appData: latest.AppDataRootSchema
}

async function getBridgeResult(params: {
  quoteBridgeRequest: QuoteBridgeRequest
  swapResult: QuoteResults
  intermediateTokenAmount: bigint
  bridgeQuoteRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
  provider: BridgeProvider<BridgeQuoteResult>
  signer: Signer
}): Promise<GetBridgeResultResult> {
  const { swapResult, bridgeQuoteRequestWithoutAmount, provider, quoteBridgeRequest, intermediateTokenAmount, signer } =
    params

  // Get the quote for the bridging of the intermediate token to the final token
  const bridgingQuote = await provider.getQuote({
    ...bridgeQuoteRequestWithoutAmount,
    amount: intermediateTokenAmount,
  })

  // Get the bridging call
  const unsignedBridgeCall = await provider.getUnsignedBridgeCall(quoteBridgeRequest, bridgingQuote)

  // Get the pre-authorized hook
  const bridgeHook = await provider.getSignedHook(quoteBridgeRequest.sellTokenChainId, unsignedBridgeCall, signer)

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
    tradeParameters: quoteBridgeRequest,
    bridgeCallDetails: {
      unsignedBridgeCall: unsignedBridgeCall,
      preAuthorizedBridgingHook: bridgeHook,
    },
  }

  return { bridgeResult, bridgeHook, appData }
}
