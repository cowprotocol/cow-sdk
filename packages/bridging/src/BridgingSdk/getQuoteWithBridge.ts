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
import { getGlobalAdapter, log, SignerLike } from '@cowprotocol/sdk-common'
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
import { GetQuoteWithBridgeParams } from './types'
import { getBridgeSignedHook } from './getBridgeSignedHook'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../const'
import { getHookMockForCostEstimation } from '../hooks/utils'
import { isHookBridgeProvider, isReceiverAccountBridgeProvider } from '../utils'
import { getIntermediateSwapResult } from './getIntermediateSwapResult'

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

// Common setup logic for both bridge provider types

// Common helper function for getting swap quotes

/**
 * Create a postSwapOrderFromQuote function that can be used to post the swap order from the quote
 *
 * @param params
 * @returns
 */
function createPostSwapOrderFromQuote(params: {
  getBridgeProviderQuote: (
    signer: SignerLike,
    advancedSettings?: SwapAdvancedSettings,
  ) => Promise<{ swapResult: QuoteResults; bridgeResult: BridgeQuoteResults }>
  signer: SignerLike
  sellTokenAddress: string
  orderBookApi: any
}): BridgeQuoteAndPost['postSwapOrderFromQuote'] {
  const { getBridgeProviderQuote, signer, sellTokenAddress, orderBookApi } = params

  return async function postSwapOrderFromQuote(
    advancedSettings?: SwapAdvancedSettings,
    signingStepManager?: SigningStepManager,
  ) {
    await signingStepManager?.beforeBridgingSign?.()

    // Sign the hooks with the real signer
    const { swapResult } = await getBridgeProviderQuote(signer, advancedSettings).catch((error) => {
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
      getBridgeProviderQuote,
      signer,
      sellTokenAddress: swapAndBridgeRequest.sellTokenAddress,
      orderBookApi,
    }),
  }
}

export async function getQuoteWithHookBridge<T extends BridgeQuoteResult>(
  provider: HookBridgeProvider<T>,
  params: GetQuoteWithBridgeParams,
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
