import { TTLCache } from '@cowprotocol/sdk-common'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { SingleQuoteStrategy } from './SingleQuoteStrategy'
import { MultiQuoteStrategy } from './MultiQuoteStrategy'
import { BestQuoteStrategy } from './BestQuoteStrategy'

export function createStrategies(intermediateTokensCache?: TTLCache<TokenInfo[]>) {
  return {
    singleQuoteStrategy: new SingleQuoteStrategy(intermediateTokensCache),
    multiQuoteStrategy: new MultiQuoteStrategy(intermediateTokensCache),
    bestQuoteStrategy: new BestQuoteStrategy(intermediateTokensCache),
  }
}
