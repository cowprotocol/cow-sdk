import { SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import {
  BridgeProvider,
  BridgeQuoteResult,
  CrossChainQuoteAndPost,
  MultiQuoteResult,
  QuoteBridgeRequest,
} from '../../types'
import { BridgingSdkConfig } from '../BridgingSdk'

/**
 * Base interface for all quote strategies
 */
export interface QuoteStrategy<TRequest, TResult> {
  /**
   * Execute the quote strategy
   */
  execute(request: TRequest, config: BridgingSdkConfig): Promise<TResult>
}

/**
 * Request for single quote strategy
 */
export interface SingleQuoteRequest {
  quoteBridgeRequest: QuoteBridgeRequest
  advancedSettings?: SwapAdvancedSettings
}

/**
 * Request for multi quote strategy
 */
export interface MultiQuoteRequest extends SingleQuoteRequest {
  providerDappIds?: string[]
  options?: {
    onQuoteResult?: (result: MultiQuoteResult) => void
    totalTimeout?: number
    providerTimeout?: number
  }
}

/**
 * Strategy for getting a single quote (cross-chain or single-chain)
 */
export interface SingleQuoteStrategy extends QuoteStrategy<SingleQuoteRequest, CrossChainQuoteAndPost> {
  strategyName: 'SingleQuoteStrategy'
}

/**
 * Strategy for getting quotes from multiple providers
 */
export interface MultiQuoteStrategy extends QuoteStrategy<MultiQuoteRequest, MultiQuoteResult[]> {
  strategyName: 'MultiQuoteStrategy'
}

/**
 * Strategy for getting the best quote from multiple providers
 */
export interface BestQuoteStrategy extends QuoteStrategy<MultiQuoteRequest, MultiQuoteResult | null> {
  strategyName: 'BestQuoteStrategy'
}

/**
 * Context for quote strategies that need provider resolution
 */
export interface ProviderQuoteContext {
  providers: BridgeProvider<BridgeQuoteResult>[]
  resolveProviders: (providerDappIds?: string[]) => BridgeProvider<BridgeQuoteResult>[]
}
