import {
  getTradeParametersAfterQuote,
  mergeAppDataDoc,
  OrderPostingResult,
  postSwapOrderFromQuote as postSwapOrderFromQuoteTrading,
  QuoteResults,
  QuoteResultsWithSigner,
  SigningStepManager,
  SwapAdvancedSettings,
  TradingAppDataInfo,
} from '@cowprotocol/sdk-trading'
import type { cowAppDataLatestScheme } from '@cowprotocol/sdk-app-data'
import { getGlobalAdapter, log, SignerLike } from '@cowprotocol/sdk-common'
import { OrderBookApi, OrderKind } from '@cowprotocol/sdk-order-book'
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
  DefaultBridgeProvider,
} from '../types'
import { GetQuoteWithBridgeParams } from './types'
import { getBridgeSignedHook } from './getBridgeSignedHook'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../const'
import { getHookMockForCostEstimation } from '../hooks/utils'
import { isHookBridgeProvider, isReceiverAccountBridgeProvider } from '../utils'
import { BridgeProviderQuoteError, BridgeQuoteErrorPriorities, BridgeQuoteErrors } from '../errors'
import { getIntermediateSwapResult, getRankedIntermediateTokens } from './getIntermediateSwapResult'
import { RankedIntermediateToken, TokenPriority } from './determineIntermediateToken'
import type { TokenInfo } from '@cowprotocol/sdk-config'

/**
 * How many intermediate tokens to try when the bridge provider has no route for the preferred one.
 * Every attempt costs a swap quote and a bridge quote, so this is kept small to stay within the provider timeout.
 */
export const MAX_INTERMEDIATE_TOKEN_ATTEMPTS = 3

/**
 * Lowest priority a token needs to be used as a fallback. Tokens below it ("other") are whatever the provider happens
 * to list: often illiquid, sometimes non-standard (e.g. fee-on-transfer), so they are never tried as a fallback.
 */
const MIN_FALLBACK_TOKEN_PRIORITY = TokenPriority.NATIVE

export async function getQuoteWithBridge<T extends BridgeQuoteResult>(
  provider: BridgeProvider<T>,
  params: GetQuoteWithBridgeParams,
): Promise<BridgeQuoteAndPost> {
  const { kind } = params.swapAndBridgeRequest

  // Ensure the quote request is for a sell order (only type supported for now)
  if (kind !== OrderKind.SELL) {
    throw new Error('Bridging only support SELL orders')
  }

  let getQuoteForIntermediateToken: (intermediateToken: TokenInfo) => Promise<BridgeQuoteAndPost>

  if (isHookBridgeProvider(provider)) {
    // If the provider relies on hooks
    getQuoteForIntermediateToken = (intermediateToken) => getQuoteWithHookBridge(provider, params, intermediateToken)
  } else if (isReceiverAccountBridgeProvider(provider)) {
    // If the provider doesn't rely on hooks
    getQuoteForIntermediateToken = (intermediateToken) =>
      getQuoteWithReceiverAccountBridge(provider, params, intermediateToken)
  } else {
    throw new Error('Provider type is unknown: ' + provider.type)
  }

  const candidates = selectIntermediateTokenCandidates(await getRankedIntermediateTokens(provider, params))

  return getQuoteWithIntermediateTokenFallback(candidates, getQuoteForIntermediateToken)
}

/**
 * The best ranked token is always tried (as before the fallback existed), fallbacks only among well-known tokens
 */
function selectIntermediateTokenCandidates(rankedTokens: RankedIntermediateToken[]): TokenInfo[] {
  const [best, ...rest] = rankedTokens
  if (!best) return []

  const fallbacks = rest.filter(({ priority }) => priority >= MIN_FALLBACK_TOKEN_PRIORITY)

  return [best, ...fallbacks].slice(0, MAX_INTERMEDIATE_TOKEN_ATTEMPTS).map(({ token }) => token)
}

/**
 * Tries the intermediate tokens in order and returns the first quote that succeeds.
 * A provider can list a token and still have no route for it (e.g. NEAR Intents lists WETH but has no WETH liquidity),
 * so when the first candidate fails with NO_ROUTES the next ones are tried. Any other error on the first candidate is
 * thrown right away.
 *
 * Once falling back, a candidate can fail for unrelated reasons (e.g. no CoW liquidity to swap into it). Those don't
 * replace the original error unless they are more relevant to the user (see `BridgeQuoteErrorPriorities`).
 */
async function getQuoteWithIntermediateTokenFallback(
  candidates: TokenInfo[],
  getQuoteForIntermediateToken: (intermediateToken: TokenInfo) => Promise<BridgeQuoteAndPost>,
): Promise<BridgeQuoteAndPost> {
  let bestError: unknown = new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS)

  for (const [index, intermediateToken] of candidates.entries()) {
    try {
      return await getQuoteForIntermediateToken(intermediateToken)
    } catch (error) {
      if (index === 0) {
        if (!isNoRoutesError(error)) throw error
        bestError = error
      } else if (getErrorPriority(error) > getErrorPriority(bestError)) {
        bestError = error
      }

      log(`Quote via ${intermediateToken.symbol ?? intermediateToken.address} failed, trying next intermediate token`)
    }
  }

  throw bestError
}

function isNoRoutesError(error: unknown): boolean {
  return error instanceof BridgeProviderQuoteError && error.message === BridgeQuoteErrors.NO_ROUTES
}

/**
 * Errors other than BridgeProviderQuoteError (e.g. a failing swap quote) rank below any bridge quote error
 */
function getErrorPriority(error: unknown): number {
  if (!(error instanceof BridgeProviderQuoteError)) return 0

  return BridgeQuoteErrorPriorities[error.message as BridgeQuoteErrors] ?? 0
}

export interface CreatePostSwapOrderFromQuoteParams {
  provider: DefaultBridgeProvider
  getBridgeProviderQuote: (
    signer: SignerLike,
    advancedSettings?: SwapAdvancedSettings,
  ) => Promise<{ swapResult: QuoteResults; bridgeResult: BridgeQuoteResults }>
  signer: SignerLike
  sellTokenAddress: string
  orderBookApi: OrderBookApi
  initialSwapResult: QuoteResults
}

/**
 * Create a postSwapOrderFromQuote function that can be used to post the swap order from the quote
 *
 * @param params
 * @returns
 */
export function createPostSwapOrderFromQuote(
  params: CreatePostSwapOrderFromQuoteParams,
): BridgeQuoteAndPost['postSwapOrderFromQuote'] {
  const { provider, getBridgeProviderQuote, signer, sellTokenAddress, orderBookApi, initialSwapResult } = params

  return async function postSwapOrderFromQuote(
    advancedSettings?: SwapAdvancedSettings,
    signingStepManager?: SigningStepManager,
  ) {
    await signingStepManager?.beforeBridgingSign?.()

    const skipQuoteRefetch = isReceiverAccountBridgeProvider(provider)

    const appDataOverride = advancedSettings?.appData
    const appDataInfo =
      appDataOverride && skipQuoteRefetch
        ? await mergeAppDataDoc(initialSwapResult.appDataInfo.doc, appDataOverride)
        : initialSwapResult.appDataInfo

    const swapResult: QuoteResults = skipQuoteRefetch
      ? {
          ...initialSwapResult,
          appDataInfo,
        }
      : // Sign the hooks with the real signer
        (
          await getBridgeProviderQuote(signer, advancedSettings).catch((error) => {
            signingStepManager?.onBridgingSignError?.()
            throw error
          })
        ).swapResult

    await signingStepManager?.afterBridgingSign?.()

    const quoteResults: QuoteResultsWithSigner = {
      result: {
        ...swapResult,
        tradeParameters: getTradeParametersAfterQuote({
          quoteParameters: swapResult.tradeParameters,
          sellToken: sellTokenAddress,
        }),
        signer: signer as any,
      },
      orderBookApi,
    }

    await signingStepManager?.beforeOrderSign?.()

    return postSwapOrderFromQuoteTrading(quoteResults, {
      ...advancedSettings,
      appData: swapResult.appDataInfo.doc,
      quoteRequest: {
        ...advancedSettings?.quoteRequest,
        // Changing receiver back for the quote request
        receiver: swapResult.tradeParameters.receiver,
      },
    })
      .then(async (result: OrderPostingResult) => {
        await signingStepManager?.afterOrderSign?.()
        return result
      })
      .catch((error: unknown) => {
        // TODO: Not from this PR. It should not assume that an error posting the order is due to the signing error
        signingStepManager?.onOrderSignError?.()
        throw error
      })
  }
}

export async function getQuoteWithReceiverAccountBridge<T extends BridgeQuoteResult>(
  provider: AccountBridgeProvider<T>,
  params: GetQuoteWithBridgeParams,
  intermediateToken?: TokenInfo,
): Promise<BridgeQuoteAndPost> {
  // Get intermediate swap result
  const {
    swapAndBridgeRequest,
    signer,
    bridgeRequestWithoutAmount,
    intermediateTokenAmount,
    swapResult,
    orderBookApi,
  } = await getIntermediateSwapResult({
    provider,
    params,
    intermediateToken,
  })

  // Get a new bridge provider quote result
  async function getBridgeProviderQuote(): Promise<{ swapResult: QuoteResults; bridgeResult: BridgeQuoteResults }> {
    const { bridgeReceiverOverride, bridgeResult } = await getAccountBridgeResult(provider, {
      swapAndBridgeRequest,
      bridgeRequestWithoutAmount,
      intermediateTokenAmount,
    })

    // Update the receiver
    log(`Bridge receiver override: ${bridgeReceiverOverride}`)
    swapResult.tradeParameters.receiver = bridgeReceiverOverride

    // Update appData with bridge quote details
    swapResult.appDataInfo = await mergeAppDataDoc(swapResult.appDataInfo.doc, {
      metadata: {
        bridging: overrideAppDataWithBridgingQuoteDetails(swapResult.appDataInfo.doc.metadata.bridging, bridgeResult),
      },
    })

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

  const result = await getBridgeProviderQuote()

  return {
    swap: result.swapResult,
    bridge: result.bridgeResult,
    postSwapOrderFromQuote: createPostSwapOrderFromQuote({
      provider,
      getBridgeProviderQuote,
      signer,
      sellTokenAddress: swapAndBridgeRequest.sellTokenAddress,
      orderBookApi,
      initialSwapResult: result.swapResult,
    }),
  }
}

export async function getQuoteWithHookBridge<T extends BridgeQuoteResult>(
  provider: HookBridgeProvider<T>,
  params: GetQuoteWithBridgeParams,
  intermediateToken?: TokenInfo,
): Promise<BridgeQuoteAndPost> {
  const { quoteSigner } = params

  // Get intermediate swap result
  const {
    signer,
    swapAndBridgeRequest,
    bridgeRequestWithoutAmount,
    intermediateTokenAmount,
    orderBookApi,
    swapResult,
  } = await getIntermediateSwapResult({
    provider,
    params,
    intermediateToken,
    getBridgeHook: async (bridgeRequestWithoutAmount) => {
      // Get the hook mock for cost estimation
      const hookEstimatedGasLimit = await provider.getGasLimitEstimationForHook(bridgeRequestWithoutAmount)
      const mockedHook = getHookMockForCostEstimation(hookEstimatedGasLimit)
      log(`Using mocked hook for swap gas estimation: ${JSON.stringify(mockedHook)}`)
      return mockedHook
    },
  })

  // Get the hook gas limit estimation (for later use in getBridgeProviderQuote)
  const hookEstimatedGasLimit = await provider.getGasLimitEstimationForHook(bridgeRequestWithoutAmount)

  // Get a new bridge provider quote result
  async function getBridgeProviderQuote(
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
      swapAndBridgeRequest,
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

  const result = await getBridgeProviderQuote(
    // Sign the hooks with quoteSigner if provided
    quoteSigner ? getGlobalAdapter().createSigner(quoteSigner) : signer,
    // Use estimated hook gas limit if quoteSigner is provided, so we don't have to estimate the hook gas limit twice
    // Moreover, since quoteSigner is not the real signer, the estimation will fail
    hookEstimatedGasLimit,
  )

  return {
    swap: result.swapResult,
    bridge: result.bridgeResult,
    postSwapOrderFromQuote: createPostSwapOrderFromQuote({
      getBridgeProviderQuote: (signer, advancedSettings) =>
        getBridgeProviderQuote(signer, hookEstimatedGasLimit, advancedSettings),
      signer,
      sellTokenAddress: swapAndBridgeRequest.sellTokenAddress,
      orderBookApi,
      provider,
      initialSwapResult: result.swapResult,
    }),
  }
}

export interface BaseBridgeResultContext {
  swapAndBridgeRequest: QuoteBridgeRequest
  intermediateTokenAmount: bigint
  bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
}

async function getAccountBridgeResult<T extends BridgeQuoteResult>(
  provider: AccountBridgeProvider<T>,
  context: BaseBridgeResultContext,
): Promise<{
  bridgeResult: BridgeQuoteResults
  bridgeReceiverOverride: string
}> {
  const { bridgeRequestWithoutAmount, intermediateTokenAmount } = context

  const bridgeRequest: QuoteBridgeRequest = {
    ...bridgeRequestWithoutAmount,
    amount: intermediateTokenAmount,
  }

  // Get the bridge quote
  const bridgingQuote = await provider.getQuote(bridgeRequest)

  // Get the receiver account
  const bridgeReceiverOverride = await provider.getBridgeReceiverOverride(bridgeRequest, bridgingQuote)

  // Prepare the bridge result
  const bridgeResult: BridgeQuoteResults = {
    id: bridgingQuote.id,
    signature: bridgingQuote.signature,
    attestationSignature: bridgingQuote.attestationSignature,
    quoteBody: bridgingQuote.quoteBody,
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

  return { bridgeResult, bridgeReceiverOverride }
}

export interface HookBridgeResultContext extends BaseBridgeResultContext {
  swapResult: QuoteResults
  hookGasLimit: number
  appDataOverride?: SwapAdvancedSettings['appData']
  validToOverride?: number
  signer?: SignerLike
}

async function getHookBridgeResult<T extends BridgeQuoteResult>(
  provider: HookBridgeProvider<T>,
  context: HookBridgeResultContext,
): Promise<{
  bridgeResult: BridgeQuoteResults
  bridgeHook: BridgeHook
  appDataInfo: TradingAppDataInfo
}> {
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
      bridging: overrideAppDataWithBridgingQuoteDetails(swapResult.appDataInfo.doc.metadata.bridging, bridgingQuote),
      hooks: {
        pre: swapResultHooks?.pre,
        post: [...postHooks, ...[bridgeHook.postHook]],
      },
    },
  })

  // Prepare the bridge result
  const bridgeResult: BridgeQuoteResults = {
    providerInfo: provider.info,
    id: bridgingQuote.id,
    signature: bridgingQuote.signature,
    attestationSignature: bridgingQuote.attestationSignature,
    quoteBody: bridgingQuote.quoteBody,
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

function overrideAppDataWithBridgingQuoteDetails(
  bridgingMetaData: cowAppDataLatestScheme.Bridging | undefined,
  quote: BridgeQuoteResult,
): typeof bridgingMetaData {
  if (!bridgingMetaData) return bridgingMetaData

  return {
    ...bridgingMetaData,
    ...(quote.id ? { quoteId: quote.id } : undefined),
    ...(quote.signature ? { quoteSignature: quote.signature } : undefined),
    ...(quote.attestationSignature ? { attestationSignature: quote.attestationSignature } : undefined),
    ...(quote.quoteBody ? { quoteBody: quote.quoteBody } : undefined),
  }
}
