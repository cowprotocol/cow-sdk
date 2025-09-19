import { BridgeProvider, BridgeQuoteResult } from '../types'
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { CowEnv, SupportedChainId } from '@cowprotocol/sdk-config'

/**
 * Cache configuration for BridgingSdk
 */
export interface BridgingSdkCacheConfig {
  /**
   * Enable caching for target networks and buy tokens
   */
  enabled: boolean
  /**
   * TTL in milliseconds for getIntermediateTokens cache
   */
  intermediateTokensTtl: number
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
  cacheConfig?: BridgingSdkCacheConfig
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
