import { MultiQuoteResult, BestQuoteProviderContext } from '../../types'
import { BridgingSdkConfig } from '../BridgingSdk'
import {
  createBridgeQuoteTimeoutPromise,
  executeProviderQuotes,
  isBetterQuote,
  resolveProvidersToQuery,
  safeCallBestQuoteCallback,
  validateCrossChainRequest,
} from '../utils'
import { getQuoteWithBridge } from '../getQuoteWithBridge'
import { BestQuoteStrategy, MultiQuoteRequest } from './QuoteStrategy'
import { BridgeProviderError } from '../../errors'

const DEFAULT_TOTAL_TIMEOUT_MS = 40_000 // 40 seconds
const DEFAULT_PROVIDER_TIMEOUT_MS = 20_000 // 20 seconds

/**
 * Strategy for getting the best quote from multiple providers
 */
export class BestQuoteStrategyImpl implements BestQuoteStrategy {
  readonly strategyName = 'BestQuoteStrategy'

  async execute(request: MultiQuoteRequest, config: BridgingSdkConfig): Promise<MultiQuoteResult | null> {
    const { quoteBridgeRequest, providerDappIds, advancedSettings, options } = request
    const { sellTokenChainId, buyTokenChainId } = quoteBridgeRequest

    // Validate that this is a cross-chain request
    validateCrossChainRequest(sellTokenChainId, buyTokenChainId)

    // Determine which providers to query
    const providersToQuery = resolveProvidersToQuery(providerDappIds, config.providers)

    // Extract options with defaults
    const {
      onQuoteResult,
      totalTimeout = DEFAULT_TOTAL_TIMEOUT_MS,
      providerTimeout = DEFAULT_PROVIDER_TIMEOUT_MS,
    } = options || {}

    // Keep track of the current best result and first error using mutable containers
    const bestResult = { current: null as MultiQuoteResult | null }
    const firstError = { current: null as MultiQuoteResult | null }
    const promises: Promise<void>[] = []

    // Create a promise for each provider that handles both progressive callbacks and best result tracking
    for (const provider of providersToQuery) {
      const context: BestQuoteProviderContext = {
        provider,
        quoteBridgeRequest,
        advancedSettings,
        providerTimeout,
        onQuoteResult,
        bestResult,
        firstError,
      }

      const promise = this.createBestQuoteProviderPromise(context, config)
      promises.push(promise)
    }

    // Execute all provider quotes with timeout handling
    await executeProviderQuotes(promises, totalTimeout, config)

    // Return best result if available, otherwise return first error
    return bestResult.current || firstError.current
  }

  private createBestQuoteProviderPromise(context: BestQuoteProviderContext, config: BridgingSdkConfig): Promise<void> {
    const { provider, quoteBridgeRequest, advancedSettings, providerTimeout, onQuoteResult, bestResult, firstError } =
      context

    return (async (): Promise<void> => {
      try {
        // Race between the actual quote request and the provider timeout
        const quote = await Promise.race([
          getQuoteWithBridge({
            swapAndBridgeRequest: quoteBridgeRequest,
            advancedSettings,
            tradingSdk: config.tradingSdk,
            provider,
            bridgeHookSigner: advancedSettings?.quoteSigner,
          }),
          createBridgeQuoteTimeoutPromise(providerTimeout, `Provider ${provider.info.dappId}`),
        ])

        const result: MultiQuoteResult = {
          providerDappId: provider.info.dappId,
          quote,
          error: undefined,
        }

        // Check if this quote is better than the current best
        if (isBetterQuote(result, bestResult.current)) {
          bestResult.current = result
          // Call callback only for better quotes
          safeCallBestQuoteCallback(onQuoteResult, result)
        }
      } catch (error) {
        const errorResult: MultiQuoteResult = {
          providerDappId: provider.info.dappId,
          quote: null,
          error: error instanceof Error ? error : new BridgeProviderError(String(error), {}),
        }

        // Store the first error if we don't have one yet
        if (!firstError.current) {
          firstError.current = errorResult
        }
      }
    })()
  }
}
