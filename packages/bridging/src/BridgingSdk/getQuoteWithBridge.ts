import {
  getTradeParametersAfterQuote,
  mergeAppDataDoc,
  postSwapOrderFromQuote,
  QuoteResults,
  QuoteResultsWithSigner,
  SigningStepManager,
  SwapAdvancedSettings,
  TradeParameters,
  WithPartialTraderParams,
} from '@cowprotocol/sdk-trading'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { getGlobalAdapter, jsonWithBigintReplacer, log, SignerLike, TTLCache } from '@cowprotocol/sdk-common'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import {
  BridgeProvider,
  BridgeQuoteAndPost,
  BridgeQuoteResult,
  BridgeQuoteResults,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from '../types'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'
import { BridgeResultContext, GetBridgeResultResult, GetQuoteWithBridgeParams } from './types'
import { getBridgeSignedHook } from './getBridgeSignedHook'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../const'
import { getHookMockForCostEstimation } from '../hooks/utils'
import { getCacheKey } from './helpers'

export async function getQuoteWithBridge<T extends BridgeQuoteResult>(
  params: GetQuoteWithBridgeParams<T>,
): Promise<BridgeQuoteAndPost> {
  const { provider, swapAndBridgeRequest, advancedSettings, tradingSdk, bridgeHookSigner } = params
  const {
    kind,
    sellTokenChainId,
    sellTokenAddress,
    buyTokenChainId,
    buyTokenAddress,
    amount,
    signer: signerLike,
    ...rest
  } = swapAndBridgeRequest

  const adapter = getGlobalAdapter()
  const signer = signerLike ? adapter.createSigner(signerLike) : adapter.signer

  if (kind !== OrderKind.SELL) {
    throw new Error('Bridging only support SELL orders')
  }

  log(
    `Cross-chain ${kind} ${amount} ${sellTokenAddress} (source chain ${sellTokenChainId}) for ${buyTokenAddress} (target chain ${buyTokenChainId})`,
  )

  // Get the mocked hook (for estimating the additional swap costs)
  const bridgeRequestWithoutAmount = await getBaseBridgeQuoteRequest({
    swapAndBridgeRequest: swapAndBridgeRequest,
    provider,
    intermediateTokensCache: params.intermediateTokensCache,
    intermediateTokensTtl: params.intermediateTokensTtl,
  })

  // Get the hook mock for cost estimation
  const hookEstimatedGasLimit = await provider.getGasLimitEstimationForHook(bridgeRequestWithoutAmount)
  const mockedHook = getHookMockForCostEstimation(hookEstimatedGasLimit)
  log(`Using mocked hook for swap gas estimation: ${JSON.stringify(mockedHook)}`)

  const { sellTokenAddress: intermediateToken, sellTokenDecimals: intermediaryTokenDecimals } =
    bridgeRequestWithoutAmount

  // Estimate the expected amount of intermediate tokens received in CoW Protocol's swap
  const swapParams: WithPartialTraderParams<TradeParameters> = {
    ...rest,
    kind,
    chainId: sellTokenChainId,
    sellToken: sellTokenAddress,
    buyToken: intermediateToken,
    buyTokenDecimals: intermediaryTokenDecimals,
    amount: amount.toString(),
    signer,
  }
  const { signer: _, ...swapParamsToLog } = swapParams

  log(
    `Getting a quote for the swap (sell token to buy intermediate token). Delegate to trading SDK with params: ${JSON.stringify(
      swapParamsToLog,
      jsonWithBigintReplacer,
    )}`,
  )

  const advancedSettingsHooks = advancedSettings?.appData?.metadata?.hooks

  const { result: swapResult, orderBookApi } = await tradingSdk.getQuoteResults(swapParams, {
    ...advancedSettings,
    appData: {
      ...advancedSettings?.appData,
      metadata: {
        hooks: {
          pre: advancedSettingsHooks?.pre,
          post: [...(advancedSettingsHooks?.post || []), mockedHook],
        },
        bridging: {
          destinationChainId: buyTokenChainId.toString(),
          destinationTokenAddress: buyTokenAddress,
        },
      },
    },
  })

  const intermediateTokenAmount = swapResult.amountsAndCosts.afterSlippage.buyAmount // Estimated, as it will likely have surplus
  log(
    `Expected to receive ${intermediateTokenAmount} of the intermediate token (${(intermediateTokenAmount / BigInt(10 ** intermediaryTokenDecimals)).toString()} formatted)`,
  )

  // Get the bridge result
  async function signHooksAndSetSwapResult(
    signer: SignerLike,
    hookGasLimit: number,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<{ swapResult: QuoteResults; bridgeResult: BridgeQuoteResults }> {
    const appDataOverride = advancedSettings?.appData
    const receiverOverride = advancedSettings?.quoteRequest?.receiver
    const validToOverride = advancedSettings?.quoteRequest?.validTo

    const {
      bridgeHook,
      appDataInfo: { doc: appData, fullAppData, appDataKeccak256 },
      bridgeResult,
    } = await getBridgeResult({
      swapAndBridgeRequest: { ...swapAndBridgeRequest, kind: OrderKind.SELL },
      swapResult,
      bridgeRequestWithoutAmount: {
        ...bridgeRequestWithoutAmount,
        receiver: receiverOverride || bridgeRequestWithoutAmount.receiver,
      },
      provider,
      intermediateTokenAmount,
      signer,
      appDataOverride,
      validToOverride,
      hookGasLimit,
    })
    log(`Bridge hook for swap: ${JSON.stringify(bridgeHook)}`)

    // Update the receiver and appData (both were mocked before we had the bridge hook)
    swapResult.tradeParameters.receiver = bridgeHook.recipient

    log(`App data for swap: appDataKeccak256=${appDataKeccak256}, fullAppData="${fullAppData}"`)
    swapResult.appDataInfo = {
      fullAppData,
      appDataKeccak256,
      doc: appData,
    }

    return {
      bridgeResult,
      swapResult: {
        ...swapResult,
        tradeParameters: {
          ...swapResult.tradeParameters,
          receiver: bridgeHook.recipient,
        },
      },
    }
  }

  log(`Using gas limit: ${hookEstimatedGasLimit}`)

  const result = await signHooksAndSetSwapResult(
    // Sign the hooks with bridgeHookSigner if provided
    bridgeHookSigner ? adapter.createSigner(bridgeHookSigner) : signer,
    // Use estimated hook gas limit if bridgeHookSigner is provided, so we don't have to estimate the hook gas limit twice
    // Moreover, since bridgeHookSigner is not the real signer, the estimation will fail
    hookEstimatedGasLimit,
  )

  return {
    swap: result.swapResult,
    bridge: result.bridgeResult,
    async postSwapOrderFromQuote(advancedSettings?: SwapAdvancedSettings, signingStepManager?: SigningStepManager) {
      await signingStepManager?.beforeBridgingSign?.()

      // Sign the hooks with the real signer
      const { swapResult } = await signHooksAndSetSwapResult(signer, hookEstimatedGasLimit, advancedSettings).catch(
        (error) => {
          signingStepManager?.onBridgingSignError?.()

          throw error
        },
      )

      await signingStepManager?.afterBridgingSign?.()

      const quoteResults: QuoteResultsWithSigner = {
        result: {
          ...swapResult,
          tradeParameters: getTradeParametersAfterQuote({
            quoteParameters: swapResult.tradeParameters,
            sellToken: sellTokenAddress,
          }),
          signer,
        },
        orderBookApi,
      }

      await signingStepManager?.beforeOrderSign?.()

      return postSwapOrderFromQuote(quoteResults, {
        ...advancedSettings,
        appData: swapResult.appDataInfo.doc,
        quoteRequest: {
          ...advancedSettings?.quoteRequest,
          // Changing receiver back to account proxy
          receiver: swapResult.tradeParameters.receiver,
        },
      })
        .catch((error) => {
          signingStepManager?.onOrderSignError?.()
          throw error
        })
        .then(async (result) => {
          await signingStepManager?.afterOrderSign?.()

          return result
        })
    },
  }
}

/**
 * Ge the base params (without the amount) for the bridge quote request
 */
async function getBaseBridgeQuoteRequest<T extends BridgeQuoteResult>(params: {
  swapAndBridgeRequest: QuoteBridgeRequest
  provider: BridgeProvider<T>
  intermediateTokensCache?: TTLCache<TokenInfo[]>
  intermediateTokensTtl?: number
}): Promise<QuoteBridgeRequestWithoutAmount> {
  const { provider, swapAndBridgeRequest: quoteBridgeRequest, intermediateTokensCache, intermediateTokensTtl } = params

  let intermediateTokens: TokenInfo[] = []

  const cacheKey = getCacheKey({
    id: provider.info.dappId,
    buyChainId: quoteBridgeRequest.buyTokenChainId.toString(),
    sellChainId: quoteBridgeRequest.sellTokenChainId.toString(),
    tokenAddress: quoteBridgeRequest.buyTokenAddress,
  })

  if (intermediateTokensCache && intermediateTokensCache.get(cacheKey)) {
    intermediateTokens = intermediateTokensCache.get(cacheKey) as TokenInfo[]
  } else {
    intermediateTokens = await provider.getIntermediateTokens(quoteBridgeRequest)

    if (intermediateTokensCache && intermediateTokensTtl) {
      intermediateTokensCache.set(cacheKey, intermediateTokens)
    }
  }

  if (intermediateTokens.length === 0) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS)
  }

  // We just pick the first intermediate token for now
  const intermediateToken = intermediateTokens[0]
  log(`Using ${intermediateToken} as intermediate tokens`)

  if (!intermediateToken) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS, { intermediateTokens })
  }

  // Get the gas limit estimation for the hook
  return {
    ...quoteBridgeRequest,
    sellTokenAddress: intermediateToken.address,
    sellTokenDecimals: intermediateToken.decimals,
  }
}

async function getBridgeResult(context: BridgeResultContext): Promise<GetBridgeResultResult> {
  const { swapResult, bridgeRequestWithoutAmount, provider, intermediateTokenAmount, appDataOverride } = context

  const bridgeRequest: QuoteBridgeRequest = {
    ...bridgeRequestWithoutAmount,
    amount: intermediateTokenAmount,
  }

  // Get the pre-authorized hook
  const { hook: bridgeHook, unsignedBridgeCall, bridgingQuote } = await getBridgeSignedHook(bridgeRequest, context)

  const swapAppData = await mergeAppDataDoc(swapResult.appDataInfo.doc, appDataOverride || {})

  const swapResultHooks = swapAppData.doc.metadata.hooks

  // Remove mocked hook and all previous bridge hooks from the post hooks after receiving quote
  const postHooks = (swapResultHooks?.post || []).filter((hook) => {
    return !hook.dappId?.startsWith(HOOK_DAPP_BRIDGE_PROVIDER_PREFIX)
  })

  const appDataInfo = await mergeAppDataDoc(swapAppData.doc, {
    metadata: {
      hooks: {
        pre: swapResultHooks?.pre,
        post: [...postHooks, ...[bridgeHook.postHook]],
      },
    },
  })

  // Prepare the bridge result
  const bridgeResult: BridgeQuoteResults = {
    providerInfo: provider.info,
    tradeParameters: bridgeRequest, // Just the bridge (not the swap & bridge)
    bridgeCallDetails: {
      unsignedBridgeCall: unsignedBridgeCall,
      preAuthorizedBridgingHook: bridgeHook,
    },
    isSell: bridgingQuote.isSell,
    expectedFillTimeSeconds: bridgingQuote.expectedFillTimeSeconds,
    fees: bridgingQuote.fees,
    limits: bridgingQuote.limits,
    quoteTimestamp: bridgingQuote.quoteTimestamp,
    amountsAndCosts: bridgingQuote.amountsAndCosts,
  }

  return { bridgeResult, bridgeHook, appDataInfo }
}
