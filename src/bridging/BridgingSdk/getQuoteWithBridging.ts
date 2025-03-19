import { MetadataApi } from '@cowprotocol/app-data'
import { getHookMockForCostEstimation } from '../../hooks/utils'
import { QuoteResults, SwapAdvancedSettings, TradeParameters, TradingSdk } from '../../trading'
import {
  BridgeProvider,
  BridgeQuoteAmountsAndCosts,
  BridgeQuoteAndPost,
  BridgeQuoteResult,
  BridgeQuoteResults,
  GetErc20Decimals,
  OverallBridgeQuoteResults,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from '../types'
import { getSigner } from '../../common/utils/wallet'
import { QuoteAmountsAndCosts } from 'src/order-book'

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

  const bridgeResults: BridgeQuoteResults = {
    providerInfo: provider.info,
    amountsAndCosts: toAmountAndCosts(quoteBridgeRequest, bridgingQuote),
    intermediateTokenAddress: intermediateTokenAddress,
    unsignedBridgeCall: unsignedBridgeCall,
    preAuthorizedBridgingHook: bridgeHook,
    quoteResponse: bridgingQuote,
  }

  const overallResults: OverallBridgeQuoteResults = {
    params: quoteBridgeRequest,
    amountsAndCosts: getOverallAmountsAndCosts(quoteBridgeRequest, bridgingQuote, swapQuote),
  }

  return {
    overallResults,
    swapResults: swapQuote,
    bridgeResults,
    async postSwapOrderFromQuote() {
      // TODO: Implement
      console.log('Post order!', { swapParams, appData })
      return '0xfc4dd62471d2f39b2f58f672dfe4725de11dd2efc0f68d116571a6d3da0cee2479063d9173c09887d536924e2f6eadbabac099f567843020'
    },
  }
}

function toAmountAndCosts(
  _quoteBridgeRequest: QuoteBridgeRequest,
  _bridgingQuote: BridgeQuoteResult
): BridgeQuoteAmountsAndCosts {
  // TODO: Implement
  return {
    beforeFee: {
      sellAmount: 0n,
      buyAmount: 0n,
    },
    afterFee: {
      sellAmount: 0n,
      buyAmount: 0n,
    },
    afterSlippage: {
      sellAmount: 0n,
      buyAmount: 0n,
    },
  }
}

function getOverallAmountsAndCosts(
  _quoteBridgeRequest: QuoteBridgeRequest,
  _bridgingQuote: BridgeQuoteResult,
  swapQuote: QuoteResults
): QuoteAmountsAndCosts {
  // TODO: Implement. We need to add the bridging costs
  return swapQuote.amountsAndCosts,
}
