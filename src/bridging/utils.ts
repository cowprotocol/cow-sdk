import { QuoteAndPost } from '../trading'
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
