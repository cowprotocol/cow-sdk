import { AbstractProviderAdapter } from '@cowprotocol/sdk-common'
import { CowEnv, SupportedChainId, PartialApiContext as OrderBookModuleOptions } from '@cowprotocol/sdk-config'

// Re-export constructor parameter types from individual packages
export type { TraderParameters } from '@cowprotocol/sdk-trading'

/**
 * TradingSdk constructor: (traderParams: Partial<TraderParameters> = {}, options: Partial<TradingSdkOptions> = {}, adapter: AbstractProviderAdapter)
 */
export interface TradingModuleOptions {
  traderParams?: Partial<TraderParameters>
  options?: Partial<TradingSdkOptions>
}

// Re-export TradingSdkOptions from trading package
import type { TradingSdkOptions, TraderParameters } from '@cowprotocol/sdk-trading'

/**
 * Main CowSdk options interface
 */
export interface CowSdkOptions {
  /**
   * The chain ID to use for the SDK
   */
  chainId: SupportedChainId

  /**
   * The adapter to use for signing transactions and blockchain interactions
   */
  adapter: AbstractProviderAdapter

  /**
   * The environment to use (prod or staging)
   * @default 'prod'
   */
  env?: CowEnv

  /**
   * OrderBook API configuration options
   */
  orderBookOptions?: OrderBookModuleOptions

  /**
   * Custom base URL for the OrderBook API
   */
  orderBookBaseUrl?: string

  /**
   * Trading SDK configuration options
   */
  tradingOptions?: TradingModuleOptions
}
