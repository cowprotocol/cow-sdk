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
} from '../types'
import { getQuoteWithoutBridge } from './getQuoteWithoutBridge'
import { getQuoteWithBridge } from './getQuoteWithBridge'
import { getCrossChainOrder } from './getCrossChainOrder'
import { findBridgeProviderFromHook } from './findBridgeProviderFromHook'
import { BridgeProviderError } from '../errors'
import { SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { ALL_SUPPORTED_CHAINS, ChainInfo, CowEnv, SupportedChainId } from '@cowprotocol/sdk-config'
import { AbstractProviderAdapter, enableLogging, setGlobalAdapter } from '@cowprotocol/sdk-common'

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
   * Get quotes from multiple bridge providers in parallel.
   *
   * This method is specifically for cross-chain bridging quotes. For single-chain swaps, use getQuote() instead.
   *
   * @param request - The multi-quote request containing quote parameters and optional provider dappIds
   * @returns Array of results, one for each provider (successful quotes or errors)
   * @throws Error if the request is for a single-chain swap (sellTokenChainId === buyTokenChainId)
   */
  async getMultiQuotes(request: MultiQuoteRequest): Promise<MultiQuoteResult[]> {
    const { quoteBridgeRequest, providerDappIds, advancedSettings } = request
    const { sellTokenChainId, buyTokenChainId } = quoteBridgeRequest

    // Validate that this is a cross-chain request
    if (sellTokenChainId === buyTokenChainId) {
      throw new BridgeProviderError(
        'getMultiQuotes() is only for cross-chain bridging. For single-chain swaps, use getQuote() instead.',
        { config: this.config },
      )
    }

    // Determine which providers to query
    const providersToQuery = providerDappIds
      ? providerDappIds.map((dappId) => {
          const provider = this.getProviderByDappId(dappId)
          if (!provider) {
            throw new BridgeProviderError(
              `Provider with dappId '${dappId}' not found. Available providers: ${this.config.providers.map((p) => p.info.dappId).join(', ')}`,
              { config: this.config },
            )
          }
          return provider
        })
      : this.config.providers

    // Execute quotes in parallel
    const quotePromises = providersToQuery.map(async (provider): Promise<MultiQuoteResult> => {
      try {
        const quote = await getQuoteWithBridge({
          swapAndBridgeRequest: quoteBridgeRequest,
          advancedSettings,
          tradingSdk: this.config.tradingSdk,
          provider,
          bridgeHookSigner: advancedSettings?.quoteSigner,
        })

        return {
          providerDappId: provider.info.dappId,
          quote,
          error: undefined,
        }
      } catch (error) {
        return {
          providerDappId: provider.info.dappId,
          quote: null,
          error: error instanceof BridgeProviderError ? error : new BridgeProviderError(String(error), {}),
        }
      }
    })

    return Promise.all(quotePromises)
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
}
