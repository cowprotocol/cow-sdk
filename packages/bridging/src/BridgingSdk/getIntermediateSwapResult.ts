import {
  QuoteResults,
  SwapAdvancedSettings,
  TradeParameters,
  TradingSdk,
  WithPartialTraderParams,
} from '@cowprotocol/sdk-trading'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { getGlobalAdapter, jsonWithBigintReplacer, log, SignerLike, TTLCache } from '@cowprotocol/sdk-common'
import { cowAppDataLatestScheme } from '@cowprotocol/sdk-app-data'
import { BridgeQuoteResult, QuoteBridgeRequest, QuoteBridgeRequestWithoutAmount, BridgeProvider } from '../types'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'
import { GetQuoteWithBridgeParams } from './types'
import { getCacheKey } from './helpers'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { determineIntermediateToken } from './determineIntermediateToken'

export interface GetIntermediateSwapResultParams<T extends BridgeQuoteResult> {
  provider: BridgeProvider<T>
  params: GetQuoteWithBridgeParams
  getBridgeHook?: (
    bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount,
  ) => Promise<cowAppDataLatestScheme.CoWHook>
}

export interface GetIntermediateSwapResultResult {
  swapAndBridgeRequest: QuoteBridgeRequest
  signer: SignerLike
  bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
  intermediateTokenAmount: bigint
  intermediaryTokenDecimals: number
  swapResult: QuoteResults
  orderBookApi: OrderBookApi
}

export async function getIntermediateSwapResult<T extends BridgeQuoteResult>({
  provider,
  params,
  getBridgeHook,
}: GetIntermediateSwapResultParams<T>): Promise<GetIntermediateSwapResultResult> {
  const { swapAndBridgeRequest, advancedSettings, tradingSdk } = params
  const {
    kind,
    sellTokenChainId,
    sellTokenAddress,
    buyTokenChainId,
    buyTokenAddress,
    amount,
    signer: signerLike,
  } = swapAndBridgeRequest

  const adapter = getGlobalAdapter()
  const signer = signerLike ? adapter.createSigner(signerLike) : adapter.signer

  log(
    `Cross-chain ${kind} ${amount} ${sellTokenAddress} (source chain ${sellTokenChainId}) for ${buyTokenAddress} (target chain ${buyTokenChainId})`,
  )

  // Get the swap params without the amount (includes the intermediate token as buyToken)
  const intermediateTokens = await getIntermediateTokens({
    provider,
    quoteBridgeRequest: swapAndBridgeRequest,
    intermediateTokensCache: params.intermediateTokensCache,
  })

  // Determine the best intermediate token based on priority (USDC/USDT > CMS correlated > others)
  const intermediateToken = await determineIntermediateToken(
    sellTokenChainId,
    intermediateTokens,
    params.advancedSettings?.getCorrelatedTokens,
  )

  log(`Using ${intermediateToken?.name ?? intermediateToken?.address} as intermediate tokens`)

  const bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount = {
    ...swapAndBridgeRequest,
    sellTokenAddress: intermediateToken.address,
    sellTokenDecimals: intermediateToken.decimals,
  }

  const { sellTokenDecimals: intermediaryTokenDecimals } = bridgeRequestWithoutAmount

  // Get the bridge hook if provided
  const bridgeHook = getBridgeHook ? await getBridgeHook(bridgeRequestWithoutAmount) : undefined
  const advancedSettingsHooks = advancedSettings?.appData?.metadata?.hooks
  const hooks = bridgeHook
    ? {
        pre: advancedSettingsHooks?.pre,
        post: [...(advancedSettingsHooks?.post || []), bridgeHook],
      }
    : advancedSettingsHooks

  // Prepare advanced settings with optional hook
  const finalAdvancedSettings: SwapAdvancedSettings = {
    ...advancedSettings,
    appData: {
      ...advancedSettings?.appData,
      metadata: {
        hooks,
        bridging: {
          providerId: provider.info.dappId,
          destinationChainId: buyTokenChainId.toString(),
          destinationTokenAddress: buyTokenAddress,
        },
      },
    },
  }

  // Get swap quote
  const { swapResult, orderBookApi } = await getSwapQuote({
    swapAndBridgeRequest,
    bridgeRequestWithoutAmount,
    tradingSdk,
    advancedSettings: finalAdvancedSettings,
    signer,
  })

  const intermediateTokenAmount = swapResult.amountsAndCosts.afterSlippage.buyAmount // Estimated, as it will likely have surplus
  log(
    `Expected to receive ${intermediateTokenAmount} of the intermediate token (${(intermediateTokenAmount / 10n ** BigInt(intermediaryTokenDecimals)).toString()} formatted)`,
  )

  return {
    swapAndBridgeRequest,
    signer,
    bridgeRequestWithoutAmount,
    intermediateTokenAmount,
    intermediaryTokenDecimals,
    swapResult,
    orderBookApi,
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

    if (intermediateTokens?.length) {
      intermediateTokensCache?.set(cacheKey, intermediateTokens)
    }
  }

  if (intermediateTokens.length === 0) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS)
  }

  return intermediateTokens
}

export async function getSwapQuote(params: {
  swapAndBridgeRequest: QuoteBridgeRequest
  bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
  tradingSdk: TradingSdk
  advancedSettings?: SwapAdvancedSettings
  signer: SignerLike
}): Promise<{ swapResult: QuoteResults; orderBookApi: OrderBookApi }> {
  const { swapAndBridgeRequest, bridgeRequestWithoutAmount, tradingSdk, advancedSettings, signer } = params
  const {
    kind,
    sellTokenChainId,
    sellTokenAddress,
    buyTokenChainId: _buyTokenChainId,
    buyTokenAddress: _buyTokenAddress,
    bridgeSlippageBps: _bridgeSlippageBps,
    amount,
    swapSlippageBps,
    ...rest
  } = swapAndBridgeRequest

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
    slippageBps: swapSlippageBps,
    signer,
  }
  const { signer: _, ...swapParamsToLog } = swapParams

  log(
    `Getting a quote for the swap (sell token to buy intermediate token). Delegate to trading SDK with params: ${JSON.stringify(
      swapParamsToLog,
      jsonWithBigintReplacer,
    )}`,
  )

  const { result: swapResult, orderBookApi } = await tradingSdk.getQuoteResults(swapParams, advancedSettings)

  return { swapResult, orderBookApi }
}
