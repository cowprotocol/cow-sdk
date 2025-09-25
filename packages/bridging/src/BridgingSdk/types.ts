import { QuoteResults, SwapAdvancedSettings, TradingAppDataInfo, TradingSdk } from '@cowprotocol/sdk-trading'
import { SignerLike, TTLCache } from '@cowprotocol/sdk-common'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { CowEnv, SupportedChainId } from '@cowprotocol/sdk-config'
import {
  BridgeHook,
  BridgeProvider,
  BridgeQuoteResult,
  BridgeQuoteResults,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from '../types'

export type GetQuoteWithBridgeParams<T extends BridgeQuoteResult> = {
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
   * For quote fetching we have to sign bridging hooks.
   * But we won't do that using users wallet and will use some static PK.
   */
  bridgeHookSigner?: SignerLike

  /**
   * Cache for intermediate tokens.
   */
  intermediateTokensCache?: TTLCache<TokenInfo[]>
}

export interface GetBridgeResultResult {
  bridgeResult: BridgeQuoteResults
  bridgeHook: BridgeHook
  appDataInfo: TradingAppDataInfo
}

export interface BridgeResultContext<T extends BridgeQuoteResult = BridgeQuoteResult> {
  swapAndBridgeRequest: QuoteBridgeRequest
  swapResult: QuoteResults
  intermediateTokenAmount: bigint
  bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
  provider: BridgeProvider<T>
  signer?: SignerLike
  hookGasLimit: number
  validToOverride?: number
  appDataOverride?: SwapAdvancedSettings['appData']
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
