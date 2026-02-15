import { SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import { SignerLike, TTLCache } from '@cowprotocol/sdk-common'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { CowEnv, SupportedEvmChainId } from '@cowprotocol/sdk-config'
import { BridgeQuoteResult, QuoteBridgeRequest, BridgeProvider } from '../types'

export type GetQuoteWithBridgeParams = {
  /**
   * Overall request for the swap and the bridge.
   */
  swapAndBridgeRequest: QuoteBridgeRequest

  /**
   * Advanced settings for the swap.
   */
  advancedSettings?: SwapAdvancedSettings

  /**
   * Trading SDK.
   */
  tradingSdk: TradingSdk

  /**
   * Some providers need a signer for quote fetching
   * But we won't do that using users wallet and will use some static PK.
   */
  quoteSigner?: SignerLike

  /**
   * Cache for intermediate tokens.
   */
  intermediateTokensCache?: TTLCache<TokenInfo[]>

  /**
   * Allows bridging trades like (USDC (mainnet) -> USDC (mainnet) -> DAI (base)
   */
  allowIntermediateEqSellToken?: boolean
}

export type BridgingSdkConfig = Required<Omit<BridgingSdkOptions, 'enableLogging' | 'cacheConfig'>>

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
  chainId: SupportedEvmChainId
  /**
   * The unique identifier of the order.
   */
  orderId: string

  /**
   * The environment of the order
   */
  env?: CowEnv
}
