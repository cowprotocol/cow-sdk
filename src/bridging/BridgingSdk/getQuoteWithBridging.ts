import { latest } from '@cowprotocol/app-data'
import { areHooksEqual, getHookMockForCostEstimation } from '../../hooks/utils'
import {
  AppDataInfo,
  mergeAppDataDoc,
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
import { log } from '../../common/utils/log'
import { OrderKind } from '../../order-book'
import { jsonWithBigintReplacer } from '../../common/utils/serialize'
import { parseUnits } from '@ethersproject/units'
import { SignerLike } from '../../common'

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
  /**
   * For quote fetching we have to sign bridging hooks.
   * But we won't do that using users wallet and will use some static PK.
   */
  bridgeHookSigner?: SignerLike
}

export async function getQuoteWithBridge<T extends BridgeQuoteResult>(
  params: GetQuoteWithBridgeParams<T>
): Promise<BridgeQuoteAndPost> {
  const { provider, swapAndBridgeRequest, advancedSettings, getErc20Decimals, tradingSdk, bridgeHookSigner } = params
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
    `Cross-chain ${kind} ${amount} ${sellTokenAddress} (source chain ${sellTokenChainId}) for ${buyTokenAddress} (target chain ${buyTokenChainId})`
  )

  // Get the mocked hook (for estimating the additional swap costs)
  const bridgeRequestWithoutAmount = await getBaseBridgeQuoteRequest({
    swapAndBridgeRequest: swapAndBridgeRequest,
    provider,
    getErc20Decimals,
  })

  // Get the hook mock for cost estimation
  const gasLimit = provider.getGasLimitEstimationForHook(bridgeRequestWithoutAmount)
  const mockedHook = getHookMockForCostEstimation(gasLimit)
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
      jsonWithBigintReplacer
    )}`
  )

  const advancedSettingsHooks = advancedSettings?.appData?.metadata?.hooks

  const { result: swapResult, orderBookApi } = await tradingSdk.getQuoteResults(swapParams, {
    ...advancedSettings,
    appData: {
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
      intermediaryTokenDecimals
    ).toString()})`
  )

  // Get the bridge result
  async function signHooksAndSetSwapResult(
    signer: Signer
  ): Promise<{ appData: latest.AppDataRootSchema; swapResult: QuoteResults; bridgeResult: BridgeQuoteResults }> {
    const {
      bridgeHook,
      appDataInfo: { doc: appData, fullAppData, appDataKeccak256 },
      bridgeResult,
    } = await getBridgeResult({
      swapAndBridgeRequest: { ...swapAndBridgeRequest, kind: OrderKind.SELL },
      swapResult,
      bridgeRequestWithoutAmount,
      provider,
      intermediateTokenAmount,
      signer,
      mockedHook,
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
      appData,
      bridgeResult,
      swapResult: {
        ...swapResult,
        appDataInfo: {
          fullAppData,
          appDataKeccak256,
          doc: appData,
        },
        tradeParameters: {
          ...swapResult.tradeParameters,
          receiver: bridgeHook.recipient,
        },
      },
    }
  }

  // Sign the hooks with bridgeHookSigner if provided
  const result = await signHooksAndSetSwapResult(bridgeHookSigner ? getSigner(bridgeHookSigner) : signer)

  return {
    swap: result.swapResult,
    bridge: result.bridgeResult,
    async postSwapOrderFromQuote() {
      // Sign the hooks with the real signer
      const { swapResult, appData } = await signHooksAndSetSwapResult(signer)

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
    throw new Error('No path found (not intermediate token for bridging)')
  }

  // We just pick the first intermediate token for now
  const intermediateTokenAddress = intermediateTokens[0]
  log(`Using ${intermediateTokenAddress} as intermediate tokens`)

  // Get intermediate token decimals
  const intermediaryTokenDecimals = await getErc20Decimals(sellTokenChainId, intermediateTokenAddress)

  // Get the gas limit estimation for the hook
  return {
    ...quoteBridgeRequest,
    sellTokenAddress: intermediateTokenAddress,
    sellTokenDecimals: intermediaryTokenDecimals,
  }
}

interface GetBridgeResultResult {
  bridgeResult: BridgeQuoteResults
  bridgeHook: BridgeHook
  appDataInfo: AppDataInfo
}

async function getBridgeResult(params: {
  swapAndBridgeRequest: QuoteBridgeRequest
  swapResult: QuoteResults
  intermediateTokenAmount: bigint
  bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
  provider: BridgeProvider<BridgeQuoteResult>
  signer: Signer
  mockedHook: latest.CoWHook
}): Promise<GetBridgeResultResult> {
  const { swapResult, bridgeRequestWithoutAmount, provider, intermediateTokenAmount, signer, mockedHook } = params

  const bridgeRequest: QuoteBridgeRequest = {
    ...bridgeRequestWithoutAmount,
    amount: intermediateTokenAmount,
  }

  // Get the quote for the bridging of the intermediate token to the final token
  const bridgingQuote = await provider.getQuote(bridgeRequest)

  // Get the bridging call
  const unsignedBridgeCall = await provider.getUnsignedBridgeCall(bridgeRequest, bridgingQuote)

  // Get the pre-authorized hook
  const bridgeHook = await provider.getSignedHook(bridgeRequest.sellTokenChainId, unsignedBridgeCall, signer)

  const swapResultHooks = swapResult.appDataInfo.doc.metadata.hooks
  const postHooks = swapResultHooks?.post || []

  const isBridgeHookAlreadyPresent = postHooks.some((hook) => areHooksEqual(hook, bridgeHook.postHook))

  const appDataInfo = await mergeAppDataDoc(swapResult.appDataInfo.doc, {
    metadata: {
      hooks: {
        pre: swapResultHooks?.pre,
        // Remove the mocked hook from the post hooks after receiving quote
        post: [...(swapResultHooks?.post || []), ...(isBridgeHookAlreadyPresent ? [] : [bridgeHook.postHook])].filter(
          (hook) => !areHooksEqual(hook, mockedHook)
        ),
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
