import {
  getTradeParametersAfterQuote,
  mergeAppDataDoc,
  OrderPostingResult,
  postSwapOrderFromQuote,
  QuoteResults,
  QuoteResultsWithSigner,
  SigningStepManager,
  SwapAdvancedSettings,
  TradeParameters,
  TradingAppDataInfo,
  WithPartialTraderParams,
} from '@cowprotocol/sdk-trading'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { getGlobalAdapter, jsonWithBigintReplacer, log, SignerLike, TTLCache } from '@cowprotocol/sdk-common'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import {
  BridgeQuoteAndPost,
  BridgeQuoteResult,
  BridgeQuoteResults,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
  BridgeProvider,
  HookBridgeProvider,
  ReceiverAccountBridgeProvider as AccountBridgeProvider,
  BridgeHook,
} from '../types'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'
import { GetQuoteWithBridgeParams } from './types'
import { getBridgeSignedHook } from './getBridgeSignedHook'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../const'
import { getHookMockForCostEstimation } from '../hooks/utils'
import { getCacheKey } from './helpers'
import { isHookBridgeProvider, isReceiverAccountBridgeProvider } from '../utils'

export async function getQuoteWithBridge<T extends BridgeQuoteResult>(
  provider: BridgeProvider<T>,
  params: GetQuoteWithBridgeParams,
): Promise<BridgeQuoteAndPost> {
  const { kind } = params.swapAndBridgeRequest

  // Ensure the quote request is for a sell order (only type supported for now)
  if (kind !== OrderKind.SELL) {
    throw new Error('Bridging only support SELL orders')
  }

  // If the provider relies on hooks
  if (isHookBridgeProvider(provider)) {
    return getQuoteWithHookBridge(provider, params)
  }

  // If the provider doesn't rely on hooks
  if (isReceiverAccountBridgeProvider(provider)) {
    return getQuoteWithReceiverAccountBridge(provider, params)
  }

  throw new Error('Provider type is unknown: ' + provider.type)
}

export async function getQuoteWithHookBridge<T extends BridgeQuoteResult>(
  provider: HookBridgeProvider<T>,
  params: GetQuoteWithBridgeParams,
): Promise<BridgeQuoteAndPost> {
  const { swapAndBridgeRequest, advancedSettings, tradingSdk, quoteSigner } = params
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

  log(
    `Cross-chain ${kind} ${amount} ${sellTokenAddress} (source chain ${sellTokenChainId}) for ${buyTokenAddress} (target chain ${buyTokenChainId})`,
  )

  // Get the swap params without the amount (includes the intermediate token as buyToken)
  const bridgeRequestWithoutAmount = await getBaseBridgeQuoteRequest({
    swapAndBridgeRequest,
    provider,
    intermediateTokensCache: params.intermediateTokensCache,
  })

  const { sellTokenAddress: intermediateToken, sellTokenDecimals: intermediaryTokenDecimals } =
    bridgeRequestWithoutAmount

  // Get a CoW Protocol quote. This allows to get an estimation of the expected intermediate tokens received before bridging
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

  // Get the hook mock for cost estimation
  const hookEstimatedGasLimit = await provider.getGasLimitEstimationForHook(bridgeRequestWithoutAmount)
  const mockedHook = getHookMockForCostEstimation(hookEstimatedGasLimit)
  log(`Using mocked hook for swap gas estimation: ${JSON.stringify(mockedHook)}`)

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
    `Expected to receive ${intermediateTokenAmount} of the intermediate token (${(intermediateTokenAmount / 10n ** BigInt(intermediaryTokenDecimals)).toString()} formatted)`,
  )

  // Get the bridge result
  async function getBridgeQuote(
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
    } = await getHookBridgeResult(provider, {
      swapAndBridgeRequest: { ...swapAndBridgeRequest, kind: OrderKind.SELL },
      swapResult,
      bridgeRequestWithoutAmount: {
        ...bridgeRequestWithoutAmount,
        receiver: receiverOverride || bridgeRequestWithoutAmount.receiver,
      },
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

  const result = await getBridgeQuote(
    // Sign the hooks with quoteSigner if provided
    quoteSigner ? adapter.createSigner(quoteSigner) : signer,
    // Use estimated hook gas limit if quoteSigner is provided, so we don't have to estimate the hook gas limit twice
    // Moreover, since quoteSigner is not the real signer, the estimation will fail
    hookEstimatedGasLimit,
  )

  return {
    swap: result.swapResult,
    bridge: result.bridgeResult,
    async postSwapOrderFromQuote(advancedSettings?: SwapAdvancedSettings, signingStepManager?: SigningStepManager) {
      await signingStepManager?.beforeBridgingSign?.()

      // Sign the hooks with the real signer
      const { swapResult } = await getBridgeQuote(signer, hookEstimatedGasLimit, advancedSettings).catch((error) => {
        signingStepManager?.onBridgingSignError?.()

        throw error
      })

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
        .catch((error: unknown) => {
          signingStepManager?.onOrderSignError?.()
          throw error
        })
        .then(async (result: OrderPostingResult) => {
          await signingStepManager?.afterOrderSign?.()

          return result
        })
    },
  }
}

export async function getQuoteWithReceiverAccountBridge<T extends BridgeQuoteResult>(
  provider: AccountBridgeProvider<T>,
  params: GetQuoteWithBridgeParams,
): Promise<BridgeQuoteAndPost> {
  const { swapAndBridgeRequest, advancedSettings, tradingSdk, quoteSigner } = params
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

  log(
    `Cross-chain ${kind} ${amount} ${sellTokenAddress} (source chain ${sellTokenChainId}) for ${buyTokenAddress} (target chain ${buyTokenChainId})`,
  )

  // Get the swap params without the amount (includes the intermediate token as buyToken)
  const bridgeRequestWithoutAmount = await getBaseBridgeQuoteRequest({
    swapAndBridgeRequest,
    provider,
    intermediateTokensCache: params.intermediateTokensCache,
  })

  const { sellTokenAddress: intermediateToken, sellTokenDecimals: intermediaryTokenDecimals } =
    bridgeRequestWithoutAmount

  // Get a CoW Protocol quote. This allows to get an estimation of the expected intermediate tokens received before bridging
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

  const { result: swapResult, orderBookApi } = await tradingSdk.getQuoteResults(swapParams, {
    ...advancedSettings,
    appData: {
      ...advancedSettings?.appData,
      metadata: {
        hooks: advancedSettings?.appData?.metadata?.hooks,
        bridging: {
          destinationChainId: buyTokenChainId.toString(),
          destinationTokenAddress: buyTokenAddress,
        },
      },
    },
  })

  const intermediateTokenAmount = swapResult.amountsAndCosts.afterSlippage.buyAmount // Estimated, as it will likely have surplus
  log(
    `Expected to receive ${intermediateTokenAmount} of the intermediate token (${(intermediateTokenAmount / 10n ** BigInt(intermediaryTokenDecimals)).toString()} formatted)`,
  )

  async function getBridgeQuote(
    signer: SignerLike,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<{ swapResult: QuoteResults; bridgeResult: BridgeQuoteResults }> {
    const appDataOverride = advancedSettings?.appData
    const validToOverride = advancedSettings?.quoteRequest?.validTo

    const {
      bridgeReceiverOverride,
      appDataInfo: { doc: appData, fullAppData, appDataKeccak256 },
      bridgeResult,
    } = await getAccountBridgeResult(provider, {
      swapAndBridgeRequest: { ...swapAndBridgeRequest, kind: OrderKind.SELL },
      swapResult,
      bridgeRequestWithoutAmount,
      intermediateTokenAmount,
      signer,
      appDataOverride,
      validToOverride,
    })

    // Update the receiver
    log(`Bridge receiver override: ${bridgeReceiverOverride}`)
    swapResult.tradeParameters.receiver = bridgeReceiverOverride

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
          receiver: bridgeReceiverOverride,
        },
      },
    }
  }

  const result = await getBridgeQuote(
    // Sign the hooks with quoteSigner if provided
    quoteSigner ? adapter.createSigner(quoteSigner) : signer,
  )

  return {
    swap: result.swapResult,
    bridge: result.bridgeResult,
    async postSwapOrderFromQuote(advancedSettings?: SwapAdvancedSettings, signingStepManager?: SigningStepManager) {
      // Sign the hooks with the real signer
      const { swapResult } = await getBridgeQuote(signer, advancedSettings).catch((error) => {
        signingStepManager?.onBridgingSignError?.()

        throw error
      })

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
        .catch((error: unknown) => {
          signingStepManager?.onOrderSignError?.()
          throw error
        })
        .then(async (result: OrderPostingResult) => {
          await signingStepManager?.afterOrderSign?.()

          return result
        })
    },
  }
}

async function getIntermediateTokens<T extends BridgeQuoteResult>(params: {
  provider: BridgeProvider<T>
  quoteBridgeRequest: QuoteBridgeRequest
  intermediateTokensCache?: TTLCache<TokenInfo[]>
}): Promise<TokenInfo[]> {
  const { provider, quoteBridgeRequest, intermediateTokensCache } = params

  let intermediateTokens: TokenInfo[] = []
  const cacheKey = getCacheKey({
    id: provider.info.dappId,
    buyChainId: quoteBridgeRequest.buyTokenChainId.toString(),
    sellChainId: quoteBridgeRequest.sellTokenChainId.toString(),
    tokenAddress: quoteBridgeRequest.buyTokenAddress,
  })
  const cached = intermediateTokensCache?.get(cacheKey)
  if (cached) {
    intermediateTokens = cached
  } else {
    intermediateTokens = await provider.getIntermediateTokens(quoteBridgeRequest)
    intermediateTokensCache?.set(cacheKey, intermediateTokens)
  }

  if (intermediateTokens.length === 0) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS)
  }

  return intermediateTokens
}

/**
 * Ge the base params (without the amount) for the bridge quote request
 */
async function getBaseBridgeQuoteRequest<T extends BridgeQuoteResult>(params: {
  swapAndBridgeRequest: QuoteBridgeRequest
  provider: BridgeProvider<T>
  intermediateTokensCache?: TTLCache<TokenInfo[]>
}): Promise<QuoteBridgeRequestWithoutAmount> {
  const { provider, swapAndBridgeRequest: quoteBridgeRequest, intermediateTokensCache } = params

  const intermediateTokens = await getIntermediateTokens({ provider, quoteBridgeRequest, intermediateTokensCache })

  // We just pick the first intermediate token for now
  const intermediateToken = intermediateTokens[0]

  log(`Using ${intermediateToken?.name ?? intermediateToken?.address} as intermediate tokens`)

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

interface GetHookBridgeResultResult {
  bridgeResult: BridgeQuoteResults
  bridgeHook: BridgeHook
  appDataInfo: TradingAppDataInfo
}

export interface BaseBridgeResultContext {
  swapAndBridgeRequest: QuoteBridgeRequest
  swapResult: QuoteResults
  intermediateTokenAmount: bigint
  bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
  signer?: SignerLike
  validToOverride?: number
  appDataOverride?: SwapAdvancedSettings['appData']
}

export interface HookBridgeResultContext extends BaseBridgeResultContext {
  hookGasLimit: number
}

async function getHookBridgeResult<T extends BridgeQuoteResult>(
  provider: HookBridgeProvider<T>,
  context: HookBridgeResultContext,
): Promise<GetHookBridgeResultResult> {
  const { swapResult, bridgeRequestWithoutAmount, intermediateTokenAmount, appDataOverride } = context

  const bridgeRequest: QuoteBridgeRequest = {
    ...bridgeRequestWithoutAmount,
    amount: intermediateTokenAmount,
  }

  // Get the pre-authorized hook
  const {
    hook: bridgeHook,
    unsignedBridgeCall,
    bridgingQuote,
  } = await getBridgeSignedHook(provider, bridgeRequest, context)

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

interface GetAccountBridgeBridgeResult {
  bridgeResult: BridgeQuoteResults
  bridgeReceiverOverride: string
  appDataInfo: TradingAppDataInfo
}

async function getAccountBridgeResult<T extends BridgeQuoteResult>(
  provider: AccountBridgeProvider<T>,
  context: BaseBridgeResultContext,
): Promise<GetAccountBridgeBridgeResult> {
  const { swapResult, bridgeRequestWithoutAmount, intermediateTokenAmount, appDataOverride } = context

  const bridgeRequest: QuoteBridgeRequest = {
    ...bridgeRequestWithoutAmount,
    amount: intermediateTokenAmount,
  }

  const bridgingQuote = await provider.getQuote(bridgeRequest)

  const swapAppData = await mergeAppDataDoc(swapResult.appDataInfo.doc, appDataOverride || {})

  const swapResultHooks = swapAppData.doc.metadata.hooks

  const appDataInfo = await mergeAppDataDoc(swapAppData.doc, {
    metadata: {
      hooks: swapResultHooks,
    },
  })

  // Get the receiver account
  const bridgeReceiverOverride = await provider.getBridgeReceiverOverride(bridgeRequest, bridgingQuote)

  // Prepare the bridge result
  const bridgeResult: BridgeQuoteResults = {
    providerInfo: provider.info,
    tradeParameters: bridgeRequest, // Just the bridge (not the swap & bridge)
    bridgeReceiverOverride: bridgeReceiverOverride,
    isSell: bridgingQuote.isSell,
    expectedFillTimeSeconds: bridgingQuote.expectedFillTimeSeconds,
    fees: bridgingQuote.fees,
    limits: bridgingQuote.limits,
    quoteTimestamp: bridgingQuote.quoteTimestamp,
    amountsAndCosts: bridgingQuote.amountsAndCosts,
  }

  return { bridgeResult, bridgeReceiverOverride, appDataInfo }
}
