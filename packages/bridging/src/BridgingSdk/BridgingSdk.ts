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
import { ALL_SUPPORTED_CHAINS, ChainInfo, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { AbstractProviderAdapter, enableLogging, setGlobalAdapter, TTLCache } from '@cowprotocol/sdk-common'
import { BridgingSdkCacheConfig, BridgingSdkOptions, GetOrderParams } from './interfaces'
import { BridgingSdkConfig } from './types'

// Default cache configuration
const DEFAULT_CACHE_CONFIG: BridgingSdkCacheConfig = {
  enabled: true,
  intermediateTokensTtl: 5 * 60 * 1000, // 5 minutes
  buyTokensTtl: 2 * 60 * 1000, // 2 minutes
}

/**
 * SDK for bridging for swapping tokens between different chains.
 */
export class BridgingSdk {
  protected config: BridgingSdkConfig
  private cacheConfig: BridgingSdkCacheConfig
  private intermediateTokensCache: TTLCache<TokenInfo[]>
  private buyTokensCache: TTLCache<GetProviderBuyTokens>

  constructor(
    readonly options: BridgingSdkOptions,
    adapter?: AbstractProviderAdapter,
  ) {
    if (adapter) {
      setGlobalAdapter(adapter)
    }

    const { providers, cacheConfig, ...restOptions } = options

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
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...cacheConfig }

    // Initialize cache instances with localStorage persistence
    this.intermediateTokensCache = new TTLCache<TokenInfo[]>('bridging-intermediate-tokens', this.cacheConfig.enabled)
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
    return this.provider.getNetworks()
  }

  /**
   * Get the available buy tokens for buying in a specific target chain

   * @param params
   */
  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    const providerId = this.provider.info.dappId

    const cacheKey = `${providerId}-${params.buyChainId}-${params.sellChainId}-${params.sellTokenAddress}`

    if (this.cacheConfig.enabled && this.buyTokensCache.get(cacheKey)) {
      return this.buyTokensCache.get(cacheKey) as GetProviderBuyTokens
    }

    const result = await this.provider.getBuyTokens(params)
    if (this.cacheConfig.enabled) {
      this.buyTokensCache.set(cacheKey, result, this.cacheConfig.buyTokensTtl)
    }
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
        intermediateTokensCache: this.intermediateTokensCache,
        intermediateTokensTtl: this.cacheConfig.intermediateTokensTtl,
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
}
