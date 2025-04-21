import { QuoteAndPost } from '../trading'
import { latest as latestAppData } from '@cowprotocol/app-data'
import { BridgeQuoteAndPost, CrossChainQuoteAndPost } from './types'

export function isBridgeQuoteAndPost(quote: CrossChainQuoteAndPost): quote is BridgeQuoteAndPost {
  return 'bridge' in quote
}

export function isQuoteAndPost(quote: CrossChainQuoteAndPost): quote is QuoteAndPost {
  return !isBridgeQuoteAndPost(quote)
}

export function assertIsBridgeQuoteAndPost(quote: CrossChainQuoteAndPost): asserts quote is BridgeQuoteAndPost {
  if (!isBridgeQuoteAndPost(quote)) {
    throw new Error('Quote result is not of type BridgeQuoteAndPost. Are you sure the sell and buy chains different?')
  }
}

export function assertIsQuoteAndPost(quote: CrossChainQuoteAndPost): asserts quote is QuoteAndPost {
  if (!isQuoteAndPost(quote)) {
    throw new Error('Quote result is not of type QuoteAndPost. Are you sure the sell and buy chains are the same?')
  }
}

export function getPostHooks(fullAppData?: string): latestAppData.CoWHook[] {
  if (!fullAppData) {
    return []
  }

  const appData = JSON.parse(fullAppData)
  if (!isAppDoc(appData)) {
    return []
  }

  if (!appData.metadata.hooks) {
    return []
  }

  return appData.metadata.hooks.post || []
}

// TODO: Move to app-data project
export function isAppDoc(appData: unknown): appData is latestAppData.AppDataRootSchema {
  return typeof appData === 'object' && appData !== null && 'version' in appData && 'metadata' in appData
}
