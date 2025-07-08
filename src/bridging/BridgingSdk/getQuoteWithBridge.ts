import { getHookMockForCostEstimation } from '../../hooks/utils'
import {
  mergeAppDataDoc,
  postSwapOrderFromQuote,
  QuoteResults,
  SwapAdvancedSettings,
  TradeParameters,
  WithPartialTraderParams,
} from '../../trading'
import {
  BridgeProvider,
  BridgeQuoteAndPost,
  BridgeQuoteResult,
  BridgeQuoteResults,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from '../types'
import { Signer } from '@ethersproject/abstract-signer'
import { getSigner } from '../../common/utils/wallet'
import { log } from '../../common/utils/log'
import { OrderKind } from '../../order-book'
import { jsonWithBigintReplacer } from '../../common/utils/serialize'
import { parseUnits } from '@ethersproject/units'
import { QuoteResultsWithSigner } from '../../trading/getQuote'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'
import { getTradeParametersAfterQuote } from '../../trading/utils/misc'
import { BridgeResultContext, GetBridgeResultResult, GetQuoteWithBridgeParams } from './types'
import { getBridgeSignedHook } from './getBridgeSignedHook'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../const'

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

  const signer = getSigner(signerLike)

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
      },
    },
  })

  const intermediateTokenAmount = swapResult.amountsAndCosts.afterSlippage.buyAmount // Estimated, as it will likely have surplus
  log(
    `Expected to receive ${intermediateTokenAmount} of the intermediate token (${parseUnits(
      intermediateTokenAmount.toString(),
      intermediaryTokenDecimals,
    ).toString()})`,
  )

  // Get the bridge result
  async function signHooksAndSetSwapResult(
    signer: Signer,
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
    bridgeHookSigner ? getSigner(bridgeHookSigner) : signer,
    // Use estimated hook gas limit if bridgeHookSigner is provided, so we don't have to estimate the hook gas limit twice
    // Moreover, since bridgeHookSigner is not the real signer, the estimation will fail
    hookEstimatedGasLimit,
  )

  return {
    swap: result.swapResult,
    bridge: result.bridgeResult,
    async postSwapOrderFromQuote(advancedSettings?: SwapAdvancedSettings) {
      // Sign the hooks with the real signer
      const { swapResult } = await signHooksAndSetSwapResult(signer, hookEstimatedGasLimit, advancedSettings)

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

      return postSwapOrderFromQuote(quoteResults, {
        ...advancedSettings,
        appData: swapResult.appDataInfo.doc,
        quoteRequest: {
          ...advancedSettings?.quoteRequest,
          // Changing receiver back to account proxy
          receiver: swapResult.tradeParameters.receiver,
        },
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
}): Promise<QuoteBridgeRequestWithoutAmount> {
  const { provider, swapAndBridgeRequest: quoteBridgeRequest } = params

  const intermediateTokens = await provider.getIntermediateTokens(quoteBridgeRequest)

  if (intermediateTokens.length === 0) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS)
  }

  // We just pick the first intermediate token for now
  const intermediateToken = intermediateTokens[0]
  log(`Using ${intermediateToken} as intermediate tokens`)

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
