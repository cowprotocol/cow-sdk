import { SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import { TTLCache } from '@cowprotocol/sdk-common'
import { TokenInfo } from '@cowprotocol/sdk-config'
import {
  BridgeProvider,
  BridgeQuoteResult,
  CrossChainQuoteAndPost,
  MultiQuoteResult,
  QuoteBridgeRequest,
} from '../../types'
import { BridgingSdkConfig } from '../types'

/**
 * Abstract base class for all quote strategies
 * Enforces constructor signature for cache parameters
 */
export abstract class QuoteStrategy<TRequest, TResult> {
  constructor(protected intermediateTokensCache?: TTLCache<TokenInfo[]>) {}

  /**
   * Execute the quote strategy
   */
  abstract execute(request: TRequest, config: BridgingSdkConfig): Promise<TResult>
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
export abstract class BaseSingleQuoteStrategy extends QuoteStrategy<SingleQuoteRequest, CrossChainQuoteAndPost> {
  abstract readonly strategyName: 'SingleQuoteStrategy'
}

/**
 * Strategy for getting quotes from multiple providers
 */
export abstract class BaseMultiQuoteStrategy extends QuoteStrategy<MultiQuoteRequest, MultiQuoteResult[]> {
  abstract readonly strategyName: 'MultiQuoteStrategy'
}

/**
 * Strategy for getting the best quote from multiple providers
 */
export abstract class BaseBestQuoteStrategy extends QuoteStrategy<MultiQuoteRequest, MultiQuoteResult | null> {
  abstract readonly strategyName: 'BestQuoteStrategy'
}

/**
 * Context for quote strategies that need provider resolution
 */
export interface ProviderQuoteContext {
  providers: BridgeProvider<BridgeQuoteResult>[]
  resolveProviders: (providerDappIds?: string[]) => BridgeProvider<BridgeQuoteResult>[]
}
