import {
  BuyTokensParams,
  CrossChainOrder,
  CrossChainQuoteAndPost,
  GetProviderBuyTokens,
  MultiQuoteResult,
  MultiQuoteRequest,
  QuoteBridgeRequest,
  DefaultBridgeProvider,
} from '../types'
import { getCrossChainOrder } from './getCrossChainOrder'
import { findBridgeProviderFromHook } from './findBridgeProviderFromHook'
import { SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { ALL_SUPPORTED_CHAINS, ChainInfo, TokenInfo } from '@cowprotocol/sdk-config'
import { AbstractProviderAdapter, enableLogging, setGlobalAdapter, TTLCache } from '@cowprotocol/sdk-common'
import { BridgingSdkCacheConfig, BridgingSdkConfig, BridgingSdkOptions, GetOrderParams } from './types'
import { getCacheKey } from './helpers'
import { SingleQuoteStrategy, MultiQuoteStrategy, BestQuoteStrategy } from './strategies'
import { createStrategies } from './strategies/createStrategies'
import { createBridgeRequestTimeoutPromise } from './utils'

// Default cache configuration
const DEFAULT_CACHE_CONFIG: BridgingSdkCacheConfig = {
  enabled: true,
  intermediateTokensTtl: 5 * 60 * 1000, // 5 minutes
  buyTokensTtl: 2 * 60 * 1000, // 2 minutes
}

const DEFAULT_MULTI_PROVIDER_REQUEST_TIMEOUT = 10 * 1000 // 10 seconds

/**
 * SDK for bridging for swapping tokens between different chains.
 */
export class BridgingSdk {
  protected config: BridgingSdkConfig
  private cacheConfig: BridgingSdkCacheConfig
  private intermediateTokensCache: TTLCache<TokenInfo[]>
  private buyTokensCache: TTLCache<GetProviderBuyTokens>
  private singleQuoteStrategy: SingleQuoteStrategy
  private multiQuoteStrategy: MultiQuoteStrategy
  private bestQuoteStrategy: BestQuoteStrategy

  private availableProvidersIds: string[] = []

  constructor(
    readonly options: BridgingSdkOptions,
    adapter?: AbstractProviderAdapter,
  ) {
    if (adapter) {
      setGlobalAdapter(adapter)
    }

    const { providers, cacheConfig, ...restOptions } = options

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

    // Initialize cache configuration
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...cacheConfig }

    // Initialize cache instances with localStorage persistence
    this.intermediateTokensCache = new TTLCache<TokenInfo[]>(
      'bridging-intermediate-tokens',
      this.cacheConfig.enabled,
      this.cacheConfig.intermediateTokensTtl,
    )
    this.buyTokensCache = new TTLCache<GetProviderBuyTokens>(
      'bridging-buy-tokens',
      this.cacheConfig.enabled,
      this.cacheConfig.buyTokensTtl,
    )

    const { singleQuoteStrategy, multiQuoteStrategy, bestQuoteStrategy } = createStrategies(
      this.cacheConfig.enabled ? this.intermediateTokensCache : undefined,
    )

    this.singleQuoteStrategy = singleQuoteStrategy
    this.multiQuoteStrategy = multiQuoteStrategy
    this.bestQuoteStrategy = bestQuoteStrategy
  }

  setAvailableProviders(ids: string[]) {
    this.availableProvidersIds = ids
  }

  /**
   * Get the providers for the bridging.
   */
  getAvailableProviders(): DefaultBridgeProvider[] {
    if (this.availableProvidersIds.length === 0) {
      return this.config.providers
    }

    return this.config.providers.filter((provider) => this.availableProvidersIds.includes(provider.info.dappId))
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
    const providers = this.getAvailableProviders()

    const results = await Promise.race([
      Promise.allSettled(providers.map((provider) => provider.getNetworks())),
      createBridgeRequestTimeoutPromise(
        DEFAULT_MULTI_PROVIDER_REQUEST_TIMEOUT,
        `Multi-provider getTargetNetworks with ${providers.length}`,
      ),
    ])

    return results.reduce<ChainInfo[]>((acc, result) => {
      if (result.status === 'fulfilled') {
        const networksToAdd = (result.value || []).filter((network) => !acc.includes(network))

        return acc.concat(networksToAdd)
      }

      return acc
    }, [])
  }

  /**
   * Get the available buy tokens for buying in a specific target chain

   * @param params
   */
  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    const providers = this.getAvailableProviders()

    const results = await Promise.race([
      Promise.allSettled(providers.map((provider) => this.getBuyTokensFromProvider(provider, params))),
      createBridgeRequestTimeoutPromise(
        DEFAULT_MULTI_PROVIDER_REQUEST_TIMEOUT,
        `Multi-provider getBuyTokens with ${providers.length}`,
      ),
    ])

    const isRouteAvailable = results.reduce((isRouteAvailable, result) => {
      if (result.status === 'fulfilled' && result.value.isRouteAvailable) {
        return true
      }

      return isRouteAvailable
    }, false)

    const tokens = results.reduce((tokens, result) => {
      if (result.status === 'fulfilled' && result.value.tokens) {
        result.value.tokens.forEach((token) => {
          const addressLower = token.address.toLowerCase()

          if (!tokens.get(addressLower)) {
            tokens.set(addressLower, token)
          }
        })
      }

      return tokens
    }, new Map<string, TokenInfo>())

    return { isRouteAvailable, tokens: [...tokens.values()] }
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
    return this.singleQuoteStrategy.execute(
      {
        quoteBridgeRequest,
        advancedSettings,
      },
      this.config.tradingSdk,
      this.getAvailableProviders(),
    )
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
    return this.multiQuoteStrategy.execute(request, this.config.tradingSdk, this.getAvailableProviders())
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
    return this.bestQuoteStrategy.execute(request, this.config.tradingSdk, this.getAvailableProviders())
  }

  async getOrder(params: GetOrderParams): Promise<CrossChainOrder | null> {
    const { orderBookApi } = this.config

    const { chainId, orderId, env = orderBookApi.context.env } = params

    return getCrossChainOrder({
      chainId,
      orderId,
      orderBookApi,
      env,
      providers: this.getAvailableProviders(),
    })
  }

  getProviderFromAppData(fullAppData: string): DefaultBridgeProvider | undefined {
    return findBridgeProviderFromHook(fullAppData, this.getAvailableProviders())
  }

  /**
   * Clear all caches. Useful for testing and debugging.
   */
  clearCache(): void {
    this.intermediateTokensCache.clear()
    this.buyTokensCache.clear()
  }

  /**
   * Clean up expired cache entries. Useful for maintenance.
   */
  cleanupExpiredCache(): void {
    this.intermediateTokensCache.cleanup()
    this.buyTokensCache.cleanup()
  }

  /**
   * Get cache statistics for debugging.
   */
  getCacheStats(): { intermediateTokens: number; buyTokens: number } {
    return {
      intermediateTokens: this.intermediateTokensCache.size(),
      buyTokens: this.buyTokensCache.size(),
    }
  }

  getProviderByDappId(dappId: string): DefaultBridgeProvider | undefined {
    return this.getAvailableProviders().find((provider) => provider.info.dappId === dappId)
  }

  private async getBuyTokensFromProvider(
    provider: DefaultBridgeProvider,
    params: BuyTokensParams,
  ): Promise<GetProviderBuyTokens> {
    const providerId = provider.info.dappId

    const cacheKey = getCacheKey({
      id: providerId,
      buyChainId: params.buyChainId.toString(),
      sellChainId: params.sellChainId?.toString(),
      tokenAddress: params.sellTokenAddress,
    })

    const cached = this.cacheConfig.enabled && this.buyTokensCache.get(cacheKey)

    if (cached) {
      return cached
    }

    const result = await provider.getBuyTokens(params)
    if (this.cacheConfig.enabled) {
      this.buyTokensCache.set(cacheKey, result)
    }
    return result
  }
}
