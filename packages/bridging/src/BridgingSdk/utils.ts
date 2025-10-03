import { SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'
import { BridgeProviderError } from '../errors'
import {
  BridgeQuoteResult,
  MultiQuoteProgressCallback,
  MultiQuoteResult,
  BestQuoteProgressCallback,
  BridgeProvider,
} from '../types'
import { BridgingSdkConfig } from './types'

/**
 * Validates that the request is for cross-chain bridging
 */
export function validateCrossChainRequest(sellTokenChainId: SupportedChainId, buyTokenChainId: TargetChainId): void {
  if (sellTokenChainId === buyTokenChainId) {
    throw new BridgeProviderError(
      'getMultiQuotes() and getBestQuote() are only for cross-chain bridging. For single-chain swaps, use getQuote() instead.',
      { sellTokenChainId, buyTokenChainId },
    )
  }
}

// Static helper function for creating provider timeout promises
export function createBridgeQuoteTimeoutPromise(timeoutMs: number, prefix: string): Promise<never> {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new BridgeProviderError(`${prefix} timeout after ${timeoutMs}ms`, {}))
    }, timeoutMs)
  })
}

// Static helper function for safely calling progressive callbacks
export function safeCallProgressiveCallback(
  onQuoteResult: MultiQuoteProgressCallback | undefined,
  result: MultiQuoteResult,
): void {
  if (!onQuoteResult) {
    return
  }

  try {
    onQuoteResult(result)
  } catch (callbackError) {
    // Don't let callback errors affect the quote process
    console.warn('Error in onQuoteResult callback:', callbackError)
  }
}

/**
 * Fills in timeout errors for providers that didn't complete in time
 */
export function fillTimeoutResults(
  results: MultiQuoteResult[],
  providersToQuery: BridgeProvider<BridgeQuoteResult>[],
): void {
  for (let i = 0; i < providersToQuery.length; i++) {
    const provider = providersToQuery[i]
    if (!results[i] && provider) {
      results[i] = {
        providerDappId: provider.info.dappId,
        quote: null,
        error: new BridgeProviderError('Provider request timed out', {}),
      }
    }
  }
}

/**
 * Executes all provider quote promises with timeout handling
 */
export async function executeProviderQuotes(
  promises: Promise<void>[],
  timeout: number,
  config: BridgingSdkConfig,
): Promise<void> {
  try {
    // Wait for either all promises to complete or timeout
    await Promise.race([
      Promise.allSettled(promises),
      createBridgeQuoteTimeoutPromise(timeout, `Multi-quote with ${config.providers.length}`),
    ])
  } catch {
    // If timeout occurs, we still return whatever results we have
    console.warn('getMultiQuotes timeout occurred, returning partial results')
  }
}

/**
 * Compares two quotes to determine which has a higher buyAmount after slippage
 * Returns true if quote1 is better than quote2, false otherwise
 */
export function isBetterQuote(quote1: MultiQuoteResult, quote2: MultiQuoteResult | null): boolean {
  // If we don't have a current best quote, any successful quote is better
  if (!quote2 || !quote2.quote) {
    return !!quote1.quote
  }

  // If the new quote failed but we have a successful current best, it's not better
  if (!quote1.quote) {
    return false
  }

  // Both quotes are successful, compare buyAmount after slippage
  const quote1BuyAmount = quote1.quote.bridge.amountsAndCosts.afterSlippage.buyAmount
  const quote2BuyAmount = quote2.quote.bridge.amountsAndCosts.afterSlippage.buyAmount

  return quote1BuyAmount > quote2BuyAmount
}

/**
 * Safely calls the best quote progress callback
 */
export function safeCallBestQuoteCallback(
  onQuoteResult: BestQuoteProgressCallback | undefined,
  result: MultiQuoteResult,
): void {
  if (!onQuoteResult) {
    return
  }

  try {
    onQuoteResult(result)
  } catch (callbackError) {
    // Don't let callback errors affect the quote process
    console.warn('Error in onQuoteResult callback:', callbackError)
  }
}

export function resolveProvidersToQuery(
  providerDappIds: string[] | undefined,
  providers: BridgeProvider<BridgeQuoteResult>[],
): BridgeProvider<BridgeQuoteResult>[] {
  if (!providerDappIds) {
    return providers
  }

  return providerDappIds.map((dappId) => {
    const provider = providers.find((p) => p.info.dappId === dappId)
    if (!provider) {
      throw new BridgeProviderError(
        `Provider with dappId '${dappId}' not found. Available providers: ${providers.map((p) => p.info.dappId).join(', ')}`,
        { providers },
      )
    }
    return provider
  })
}
