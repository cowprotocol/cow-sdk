import { AbstractProviderAdapter } from '@cowprotocol/sdk-common'
import {
  CowEnv,
  PartialApiContext,
  SupportedChainId,
  PartialApiContext as OrderBookModuleOptions,
} from '@cowprotocol/sdk-config'

// Re-export constructor parameter types from individual packages
export type { ICoWShedOptions } from '@cowprotocol/sdk-cow-shed'
export type { TraderParameters } from '@cowprotocol/sdk-trading'
export type { ConditionalOrderRegistry, Orders, ProofLocation } from '@cowprotocol/sdk-composable'

/**
 * SubgraphApi constructor: (context: PartialSubgraphApiContext = {}, apiKey?: string)
 */
export interface SubgraphModuleOptions {
  context?: PartialApiContext
  apiKey?: string
}

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
 * CowShedSdk constructor: (adapter: AbstractProviderAdapter, factoryOptions?: ICoWShedOptions)
 */
export interface CowShedModuleOptions {
  factoryOptions?: ICoWShedOptions
}

// Re-export types needed for CowShed
import type { ICoWShedOptions } from '@cowprotocol/sdk-cow-shed'

/**
 * ConditionalOrderFactory constructor: (registry: ConditionalOrderRegistry, adapter?: AbstractProviderAdapter)
 * Multiplexer constructor: (chain: SupportedChainId, orders?: Orders, root?: string, location: ProofLocation = ProofLocation.PRIVATE)
 */
export interface ComposableModuleOptions {
  registry?: ConditionalOrderRegistry
  orders?: Orders
  root?: string
  location?: ProofLocation
}

// Re-export types needed for Composable
import type { ConditionalOrderRegistry, Orders, ProofLocation } from '@cowprotocol/sdk-composable'

export interface CowShedHooksOptions {
  factoryOptions?: ICoWShedOptions
}

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
   * Subgraph API configuration options
   */
  subgraphOptions?: SubgraphModuleOptions

  /**
   * Custom base URL for the Subgraph API
   */
  subgraphBaseUrl?: string

  /**
   * Trading SDK configuration options
   */
  tradingOptions?: TradingModuleOptions

  /**
   * CoW Shed configuration options
   */
  cowShedOptions?: CowShedModuleOptions

  /**
   * Composable CoW configuration options
   */
  composableOptions?: ComposableModuleOptions

  /**
   * CowShedHooks configuration options
   */
  cowShedHooksOptions?: CowShedHooksOptions
}
