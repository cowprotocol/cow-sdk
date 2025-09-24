import { TTLCache } from '@cowprotocol/sdk-common'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { SingleQuoteStrategy } from './SingleQuoteStrategy'
import { MultiQuoteStrategy } from './MultiQuoteStrategy'
import { BestQuoteStrategy } from './BestQuoteStrategy'

export function createStrategies(intermediateTokensCache?: TTLCache<TokenInfo[]>, intermediateTokensTtl?: number) {
  return {
    singleQuoteStrategy: new SingleQuoteStrategy(intermediateTokensCache, intermediateTokensTtl),
    multiQuoteStrategy: new MultiQuoteStrategy(intermediateTokensCache, intermediateTokensTtl),
    bestQuoteStrategy: new BestQuoteStrategy(intermediateTokensCache, intermediateTokensTtl),
  }
}
