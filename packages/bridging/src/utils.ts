import { QuoteAndPost } from '@cowprotocol/sdk-trading'
import { cowAppDataLatestScheme as latestAppData } from '@cowprotocol/sdk-app-data'
import {
  ReceiverAccountBridgeProvider,
  BridgeProvider,
  BridgeQuoteAndPost,
  BridgeQuoteResult,
  CrossChainQuoteAndPost,
  HookBridgeProvider,
} from './types'

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

export function getPostHooks(fullAppData?: string | object): latestAppData.CoWHook[] {
  if (!fullAppData) {
    return []
  }

  const appData = typeof fullAppData === 'string' ? JSON.parse(fullAppData) : fullAppData
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

export function isHookBridgeProvider<Q extends BridgeQuoteResult>(
  provider: BridgeProvider<Q>,
): provider is HookBridgeProvider<Q> {
  return provider.type === 'HookBridgeProvider'
}

export function isReceiverAccountBridgeProvider<Q extends BridgeQuoteResult>(
  provider: BridgeProvider<Q>,
): provider is ReceiverAccountBridgeProvider<Q> {
  return provider.type === 'ReceiverAccountBridgeProvider'
}
