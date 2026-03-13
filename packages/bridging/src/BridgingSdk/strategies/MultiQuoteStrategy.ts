import { TTLCache } from '@cowprotocol/sdk-common'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { DefaultBridgeProvider, MultiQuoteResult, ProviderQuoteContext } from '../../types'
import { TradingSdk } from '@cowprotocol/sdk-trading'
import {
  executeProviderQuotes,
  fillTimeoutResults,
  isBetterQuote,
  resolveProvidersToQuery,
  safeCallProgressiveCallback,
  validateCrossChainRequest,
} from '../utils'
import { BridgeProviderError } from '../../errors'
import { BaseMultiQuoteStrategy, MultiQuoteRequest } from './QuoteStrategy'
import { fetchMultiQuote } from './utils'

const DEFAULT_TOTAL_TIMEOUT_MS = 40_000 // 40 seconds
const DEFAULT_PROVIDER_TIMEOUT_MS = 20_000 // 20 seconds

/**
 * Strategy for getting quotes from multiple providers
 */
export class MultiQuoteStrategy extends BaseMultiQuoteStrategy {
  readonly strategyName = 'MultiQuoteStrategy' as const

  constructor(intermediateTokensCache?: TTLCache<TokenInfo[]>) {
    super(intermediateTokensCache)
  }

  async execute(
    request: MultiQuoteRequest,
    tradingSdk: TradingSdk,
    providers: DefaultBridgeProvider[],
  ): Promise<MultiQuoteResult[]> {
    const { quoteBridgeRequest, providerDappIds, advancedSettings, options } = request
    const { sellTokenChainId, buyTokenChainId } = quoteBridgeRequest

    // Validate that this is a cross-chain request
    validateCrossChainRequest(sellTokenChainId, buyTokenChainId)

    // Determine which providers to query
    const providersToQuery = resolveProvidersToQuery(providerDappIds, providers)

    // Extract options with defaults
    const {
      onQuoteResult,
      totalTimeout = DEFAULT_TOTAL_TIMEOUT_MS,
      providerTimeout = DEFAULT_PROVIDER_TIMEOUT_MS,
    } = options || {}

    // Keep track of results for both progressive callbacks and final return
    const results: MultiQuoteResult[] = []
    const promises: Promise<void>[] = []

    // Create a promise for each provider that handles both progressive callbacks and result collection
    for (let i = 0; i < providersToQuery.length; i++) {
      const provider = providersToQuery[i]
      if (!provider) {
        continue
      }

      const context: ProviderQuoteContext = {
        provider,
        quoteBridgeRequest,
        advancedSettings,
        providerTimeout,
        onQuoteResult,
        results,
        index: i,
      }

      const promise = this.createProviderQuotePromise(context, tradingSdk)
      promises.push(promise)
    }

    // Execute all provider quotes with timeout handling
    await executeProviderQuotes(promises, totalTimeout, providers)

    // Ensure we have a result for each provider (fill with timeout errors if needed)
    fillTimeoutResults(results, providersToQuery)

    // Sort results by buyAmount after slippage (descending, best quotes first)
    results.sort((a, b) => {
      // Use the same comparison logic as getBestQuote
      if (isBetterQuote(a, b)) return -1
      if (isBetterQuote(b, a)) return 1
      return 0
    })

    return results
  }

  private createProviderQuotePromise(context: ProviderQuoteContext, tradingSdk: TradingSdk): Promise<void> {
    const { provider, onQuoteResult, results, index } = context

    return (async (): Promise<void> => {
      try {
        const result = await fetchMultiQuote(context, tradingSdk, this.intermediateTokensCache)

        if (!result) return

        // Store result for final return
        results[index] = result

        // Call progressive callback if provided
        safeCallProgressiveCallback(onQuoteResult, result)
      } catch (error) {
        const result: MultiQuoteResult = {
          providerDappId: provider.info.dappId,
          quote: null,
          error: error instanceof Error ? error : new BridgeProviderError(String(error), {}),
        }

        // Store result for final return
        results[index] = result

        // Call progressive callback if provided
        safeCallProgressiveCallback(onQuoteResult, result)
      }
    })()
  }
}
