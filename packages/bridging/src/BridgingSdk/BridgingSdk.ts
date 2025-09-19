import {
  BridgeProvider,
  BridgeQuoteResult,
  BridgeStatusResult,
  BuyTokensParams,
  CrossChainOrder,
  CrossChainQuoteAndPost,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
} from '../types'
import { getQuoteWithoutBridge } from './getQuoteWithoutBridge'
import { getQuoteWithBridge } from './getQuoteWithBridge'
import { getCrossChainOrder } from './getCrossChainOrder'
import { findBridgeProviderFromHook } from './findBridgeProviderFromHook'
import { BridgeProviderError } from '../errors'
import { SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { ALL_SUPPORTED_CHAINS, ChainInfo, CowEnv, SupportedChainId } from '@cowprotocol/sdk-config'
import { AbstractProviderAdapter, enableLogging, setGlobalAdapter, TTLCache } from '@cowprotocol/sdk-common'

/**
 * Cache configuration for BridgingSdk
 */
export interface BridgingSdkCacheConfig {
  /**
   * Enable caching for target networks and buy tokens
   */
  enabled: boolean
  /**
   * TTL in milliseconds for getTargetNetworks cache
   */
  targetNetworksTtl: number
  /**
   * TTL in milliseconds for getBuyTokens cache
   */
  buyTokensTtl: number
}

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

  /**
   * Cache configuration for BridgingSdk
   */
  cache?: BridgingSdkCacheConfig
}

/**
 * Parameters for the `getOrder` method.
 */
export interface GetOrderParams {
  /**
   * Id of a network where order was settled
   */
  chainId: SupportedChainId
  /**
   * The unique identifier of the order.
   */
  orderId: string

  /**
   * The environment of the order
   */
  env?: CowEnv
}

export type BridgingSdkConfig = Required<Omit<BridgingSdkOptions, 'enableLogging' | 'cache'>>

// Default cache configuration
const DEFAULT_CACHE_CONFIG: BridgingSdkCacheConfig = {
  enabled: true,
  targetNetworksTtl: 5 * 60 * 1000, // 5 minutes
  buyTokensTtl: 2 * 60 * 1000, // 2 minutes
}

/**
 * SDK for bridging for swapping tokens between different chains.
 */
export class BridgingSdk {
  protected config: BridgingSdkConfig
  private cacheConfig: BridgingSdkCacheConfig
  private targetNetworksCache: TTLCache<ChainInfo[]>
  private buyTokensCache: TTLCache<GetProviderBuyTokens>

  constructor(
    readonly options: BridgingSdkOptions,
    adapter?: AbstractProviderAdapter,
  ) {
    if (adapter) {
      setGlobalAdapter(adapter)
    }

    const { providers, cache, ...restOptions } = options

    // For simplicity, we support only a single provider in the initial implementation
    if (!providers || providers.length !== 1) {
      throw new Error('Current implementation only supports a single bridge provider')
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
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...cache }

    // Initialize cache instances with localStorage persistence
    this.targetNetworksCache = new TTLCache<ChainInfo[]>('bridging-target-networks', this.cacheConfig.enabled)
    this.buyTokensCache = new TTLCache<GetProviderBuyTokens>('bridging-buy-tokens', this.cacheConfig.enabled)
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
    if (!this.cacheConfig.enabled) {
      return this.provider.getNetworks()
    }

    const cacheKey = `target-networks-${this.provider.info.dappId}`
    const cached = this.targetNetworksCache.get(cacheKey)

    if (cached) {
      return cached
    }

    const result = await this.provider.getNetworks()
    this.targetNetworksCache.set(cacheKey, result, this.cacheConfig.targetNetworksTtl)

    return result
  }

  /**
   * Get the available buy tokens for buying in a specific target chain

   * @param params
   */
  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    if (!this.cacheConfig.enabled) {
      return this.provider.getBuyTokens(params)
    }

    const cacheKey = `buy-tokens-${this.provider.info.dappId}-${params.buyChainId}-${params.sellChainId || 'any'}-${params.sellTokenAddress || 'any'}`
    const cached = this.buyTokensCache.get(cacheKey)

    if (cached) {
      return cached
    }

    const result = await this.provider.getBuyTokens(params)
    this.buyTokensCache.set(cacheKey, result, this.cacheConfig.buyTokensTtl)

    return result
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

  /**
   * Clear all caches. Useful for testing and debugging.
   */
  clearCache(): void {
    this.targetNetworksCache.clear()
    this.buyTokensCache.clear()
  }

  /**
   * Clean up expired cache entries. Useful for maintenance.
   */
  cleanupExpiredCache(): void {
    this.targetNetworksCache.cleanup()
    this.buyTokensCache.cleanup()
  }

  /**
   * Get cache statistics for debugging.
   */
  getCacheStats(): { targetNetworks: number; buyTokens: number } {
    return {
      targetNetworks: this.targetNetworksCache.size(),
      buyTokens: this.buyTokensCache.size(),
    }
  }
}
