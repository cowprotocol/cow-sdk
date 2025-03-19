import { BridgeQuoteAndPost, CrossChainQuoteAndPost } from './types'

export function isBridgeQuoteAndPost(quote: CrossChainQuoteAndPost): quote is BridgeQuoteAndPost {
  return 'bridgeQuoteResults' in quote
}
