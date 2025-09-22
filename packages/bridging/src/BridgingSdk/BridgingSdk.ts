import {
  BridgeProvider,
  BridgeQuoteResult,
  BridgeStatusResult,
  BuyTokensParams,
  CrossChainOrder,
  CrossChainQuoteAndPost,
  GetProviderBuyTokens,
  MultiQuoteRequest,
  MultiQuoteResult,
  QuoteBridgeRequest,
  ProviderQuoteContext,
  BestQuoteProviderContext,
} from '../types'
import { getQuoteWithoutBridge } from './getQuoteWithoutBridge'
import { getQuoteWithBridge } from './getQuoteWithBridge'
import { getCrossChainOrder } from './getCrossChainOrder'
import { findBridgeProviderFromHook } from './findBridgeProviderFromHook'
import { BridgeProviderError } from '../errors'
import { SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { ALL_SUPPORTED_CHAINS, ChainInfo, SupportedChainId } from '@cowprotocol/sdk-config'
import { AbstractProviderAdapter, enableLogging, setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  createProviderTimeoutPromise,
  executeProviderQuotes,
  fillTimeoutResults,
  isBetterQuote,
  safeCallBestQuoteCallback,
  safeCallProgressiveCallback,
  validateCrossChainRequest,
} from './utils'
import { GetOrderParams } from './types'

const DEFAULT_TOTAL_TIMEOUT_MS = 40_000 // 40 seconds
const DEFAULT_PROVIDER_TIMEOUT_MS = 20_000 // 20 seconds

export interface BridgingSdkOptions {
  /**
   * Providers for the bridging.
   */
  providers: BridgeProvider<BridgeQuoteResult>[]

  /**
   * Trading SDK.
   */
  tradingSdk?: TradingSdk

  /**
   * Order book API.
   */
  orderBookApi?: OrderBookApi

  /**
   * Enable logging for the bridging SDK.
   */
  enableLogging?: boolean
}

export type BridgingSdkConfig = Required<Omit<BridgingSdkOptions, 'enableLogging'>>

/**
 * SDK for bridging for swapping tokens between different chains.
 */
export class BridgingSdk {
  protected config: BridgingSdkConfig

  constructor(
    readonly options: BridgingSdkOptions,
    adapter?: AbstractProviderAdapter,
  ) {
    if (adapter) {
      setGlobalAdapter(adapter)
    }

    const { providers, ...restOptions } = options

    // Support both single and multiple providers
    if (!providers || providers.length === 0) {
      throw new Error('At least one bridge provider is required')
    }

    if (options.enableLogging !== undefined) {
      enableLogging(options.enableLogging)
    }

    const tradingSdk = options.tradingSdk ?? new TradingSdk()
    const orderBookApi = tradingSdk?.options.orderBookApi ?? new OrderBookApi()

    this.config = {
      ...restOptions,
      providers,
      tradingSdk,
      orderBookApi,
    }
  }

  private get provider(): BridgeProvider<BridgeQuoteResult> {
    const { providers } = this.config

    if (!providers[0]) {
      throw new BridgeProviderError('No provider found', { config: this.config })
    }

    return providers[0]
  }

  /**
   * Get the providers for the bridging.
   */
  getProviders(): BridgeProvider<BridgeQuoteResult>[] {
    return this.config.providers
  }

  /**
   * Get the available sources networks for the bridging.
   */
  async getSourceNetworks(): Promise<ChainInfo[]> {
    return ALL_SUPPORTED_CHAINS
  }

  /**
   * Get the available target networks for the bridging.
   */
  async getTargetNetworks(): Promise<ChainInfo[]> {
    return this.provider.getNetworks()
  }

  /**
   * Get the available buy tokens for buying in a specific target chain

   * @param params
   */
  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    return this.provider.getBuyTokens(params)
  }

  /**
   * Get quote details, including a callback function to post the order on-chain.
   *
   * This method support both, cross-chain swaps and single-chain swap.
   *
   * The return type will be either `QuoteAndPost` or `BridgeQuoteAndPost`.
   *
   * To safely assert the type in Typescript, you can use:
   * - `isBridgeQuoteAndPost(result)` utility.
   * - `isQuoteAndPost(result)` utility.
   * - `assertIsBridgeQuoteAndPost(result)` assertion.
   * - `assertIsQuoteAndPost(result)` assertion.
   *
   * @throws Error if no path is found
   */
  async getQuote(
    quoteBridgeRequest: QuoteBridgeRequest,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<CrossChainQuoteAndPost> {
    const { sellTokenChainId, buyTokenChainId } = quoteBridgeRequest
    const tradingSdk = this.config.tradingSdk

    if (sellTokenChainId !== buyTokenChainId) {
      // Cross-chain swap
      return getQuoteWithBridge({
        swapAndBridgeRequest: quoteBridgeRequest,
        advancedSettings,
        tradingSdk,
        provider: this.provider,
        bridgeHookSigner: advancedSettings?.quoteSigner,
      })
    } else {
      // Single-chain swap
      return getQuoteWithoutBridge({
        quoteBridgeRequest,
        advancedSettings,
        tradingSdk,
      })
    }
  }

  /**
   * Get quotes from multiple bridge providers in parallel with progressive results.
   *
   * This method is specifically for cross-chain bridging quotes. For single-chain swaps, use getQuote() instead.
   *
   * Features:
   * - Progressive results: Use the `onQuoteResult` callback to receive quotes as soon as each provider responds
   * - Timeout support: Configure maximum wait time for all providers and individual provider timeouts
   * - Parallel execution: All providers are queried simultaneously for best performance
   *
   * @param request - The multi-quote request containing quote parameters, provider dappIds, and options
   * @returns Array of results, one for each provider (successful quotes or errors)
   * @throws Error if the request is for a single-chain swap (sellTokenChainId === buyTokenChainId)
   * ```
   */
  async getMultiQuotes(request: MultiQuoteRequest): Promise<MultiQuoteResult[]> {
    const { quoteBridgeRequest, providerDappIds, advancedSettings, options } = request
    const { sellTokenChainId, buyTokenChainId } = quoteBridgeRequest

    // Validate that this is a cross-chain request
    validateCrossChainRequest(sellTokenChainId, buyTokenChainId)

    // Determine which providers to query
    const providersToQuery = this.resolveProvidersToQuery(providerDappIds)

    // Extract options with defaults
    const {
      onQuoteResult,
      totalTimeout = DEFAULT_TOTAL_TIMEOUT_MS,
      providerTimeout = DEFAULT_PROVIDER_TIMEOUT_MS,
    } = options || {}

    // Keep track of results for both progressive callbacks and final return
    const results: MultiQuoteResult[] = []
    const promises: Promise<void>[] = []

    // Create a promise for each provider that handles both progressive callbacks and result collection
    for (let i = 0; i < providersToQuery.length; i++) {
      const provider = providersToQuery[i]
      if (!provider) {
        continue
      }

      const context: ProviderQuoteContext = {
        provider,
        quoteBridgeRequest,
        advancedSettings,
        providerTimeout,
        onQuoteResult,
        results,
        index: i,
      }

      const promise = this.createProviderQuotePromise(context)
      promises.push(promise)
    }

    // Execute all provider quotes with timeout handling
    await executeProviderQuotes(promises, totalTimeout, this.config)

    // Ensure we have a result for each provider (fill with timeout errors if needed)
    fillTimeoutResults(results, providersToQuery)

    // Sort results by buyAmount after slippage (descending, best quotes first)
    results.sort((a, b) => {
      // Use the same comparison logic as getBestQuote
      if (isBetterQuote(a, b)) return -1
      if (isBetterQuote(b, a)) return 1
      return 0
    })

    return results
  }

  /**
   * Get the best quote from multiple bridge providers with progressive updates.
   *
   * This method is specifically for cross-chain bridging quotes. For single-chain swaps, use getQuote() instead.
   *
   * Features:
   * - Returns only the best quote based on buyAmount after slippage
   * - Progressive updates: Use the `onQuoteResult` callback to receive updates whenever a better quote is found
   * - Timeout support: Configure maximum wait time for all providers and individual provider timeouts
   * - Parallel execution: All providers are queried simultaneously for best performance
   *
   * @param request - The best quote request containing quote parameters, provider dappIds, and options
   * @returns The best quote result found, or null if no successful quotes were obtained
   * @throws Error if the request is for a single-chain swap (sellTokenChainId === buyTokenChainId)
   */
  async getBestQuote(request: MultiQuoteRequest): Promise<MultiQuoteResult | null> {
    const { quoteBridgeRequest, providerDappIds, advancedSettings, options } = request
    const { sellTokenChainId, buyTokenChainId } = quoteBridgeRequest

    // Validate that this is a cross-chain request
    validateCrossChainRequest(sellTokenChainId, buyTokenChainId)

    // Determine which providers to query
    const providersToQuery = this.resolveProvidersToQuery(providerDappIds)

    // Extract options with defaults
    const {
      onQuoteResult,
      totalTimeout = DEFAULT_TOTAL_TIMEOUT_MS,
      providerTimeout = DEFAULT_PROVIDER_TIMEOUT_MS,
    } = options || {}

    // Keep track of the current best result and first error using mutable containers
    const bestResult = { current: null as MultiQuoteResult | null }
    const firstError = { current: null as MultiQuoteResult | null }
    const promises: Promise<void>[] = []

    // Create a promise for each provider that handles both progressive callbacks and best result tracking
    for (const provider of providersToQuery) {
      const context: BestQuoteProviderContext = {
        provider,
        quoteBridgeRequest,
        advancedSettings,
        providerTimeout,
        onQuoteResult,
        bestResult,
        firstError,
      }

      const promise = this.createBestQuoteProviderPromise(context)
      promises.push(promise)
    }

    // Execute all provider quotes with timeout handling
    await executeProviderQuotes(promises, totalTimeout, this.config)

    // Return best result if available, otherwise return first error
    return bestResult.current || firstError.current
  }

  async getOrder(params: GetOrderParams): Promise<CrossChainOrder | null> {
    const { orderBookApi } = this.config

    const { chainId, orderId, env = orderBookApi.context.env } = params

    return getCrossChainOrder({
      chainId,
      orderId,
      orderBookApi,
      env,
      providers: this.config.providers,
    })
  }

  async getOrderBridgingStatus(bridgingId: string, originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    return this.provider.getStatus(bridgingId, originChainId)
  }

  getProviderFromAppData(fullAppData: string): BridgeProvider<BridgeQuoteResult> | undefined {
    return findBridgeProviderFromHook(fullAppData, this.getProviders())
  }

  getProviderByDappId(dappId: string): BridgeProvider<BridgeQuoteResult> | undefined {
    return this.config.providers.find((provider) => provider.info.dappId === dappId)
  }

  /**
   * Resolves which providers to query based on the request
   */
  private resolveProvidersToQuery(providerDappIds?: string[]): BridgeProvider<BridgeQuoteResult>[] {
    if (!providerDappIds) {
      return this.config.providers
    }

    return providerDappIds.map((dappId) => {
      const provider = this.getProviderByDappId(dappId)
      if (!provider) {
        throw new BridgeProviderError(
          `Provider with dappId '${dappId}' not found. Available providers: ${this.config.providers.map((p) => p.info.dappId).join(', ')}`,
          { config: this.config },
        )
      }
      return provider
    })
  }

  /**
   * Creates a promise that handles quote fetching for a single provider in getBestQuote
   */
  private createBestQuoteProviderPromise(context: BestQuoteProviderContext): Promise<void> {
    const { provider, quoteBridgeRequest, advancedSettings, providerTimeout, onQuoteResult, bestResult, firstError } =
      context

    return (async (): Promise<void> => {
      try {
        // Race between the actual quote request and the provider timeout
        const quote = await Promise.race([
          getQuoteWithBridge({
            swapAndBridgeRequest: quoteBridgeRequest,
            advancedSettings,
            tradingSdk: this.config.tradingSdk,
            provider,
            bridgeHookSigner: advancedSettings?.quoteSigner,
          }),
          createProviderTimeoutPromise(providerTimeout, provider.info.dappId),
        ])

        const result: MultiQuoteResult = {
          providerDappId: provider.info.dappId,
          quote,
          error: undefined,
        }

        // Check if this quote is better than the current best
        if (isBetterQuote(result, bestResult.current)) {
          bestResult.current = result
          // Call callback only for better quotes
          safeCallBestQuoteCallback(onQuoteResult, result)
        }
      } catch (error) {
        const errorResult: MultiQuoteResult = {
          providerDappId: provider.info.dappId,
          quote: null,
          error: error instanceof BridgeProviderError ? error : new BridgeProviderError(String(error), {}),
        }

        // Store the first error if we don't have one yet
        if (!firstError.current) {
          firstError.current = errorResult
        }
      }
    })()
  }

  /**
   * Creates a promise that handles quote fetching for a single provider
   */
  private createProviderQuotePromise(context: ProviderQuoteContext): Promise<void> {
    const { provider, quoteBridgeRequest, advancedSettings, providerTimeout, onQuoteResult, results, index } = context

    return (async (): Promise<void> => {
      try {
        // Race between the actual quote request and the provider timeout
        const quote = await Promise.race([
          getQuoteWithBridge({
            swapAndBridgeRequest: quoteBridgeRequest,
            advancedSettings,
            tradingSdk: this.config.tradingSdk,
            provider,
            bridgeHookSigner: advancedSettings?.quoteSigner,
          }),
          createProviderTimeoutPromise(providerTimeout, provider.info.dappId),
        ])

        const result: MultiQuoteResult = {
          providerDappId: provider.info.dappId,
          quote,
          error: undefined,
        }

        // Store result for final return
        results[index] = result

        // Call progressive callback if provided
        safeCallProgressiveCallback(onQuoteResult, result)
      } catch (error) {
        const result: MultiQuoteResult = {
          providerDappId: provider.info.dappId,
          quote: null,
          error: error instanceof BridgeProviderError ? error : new BridgeProviderError(String(error), {}),
        }

        // Store result for final return
        results[index] = result

        // Call progressive callback if provided
        safeCallProgressiveCallback(onQuoteResult, result)
      }
    })()
  }
}
