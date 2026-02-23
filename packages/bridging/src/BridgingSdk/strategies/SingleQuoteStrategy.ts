import { TTLCache } from '@cowprotocol/sdk-common'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { CrossChainQuoteAndPost, DefaultBridgeProvider } from '../../types'
import { getQuoteWithoutBridge } from '../getQuoteWithoutBridge'
import { getQuoteWithBridge } from '../getQuoteWithBridge'
import { BaseSingleQuoteStrategy, SingleQuoteRequest } from './QuoteStrategy'

/**
 * Strategy for getting a single quote (handles both cross-chain and single-chain)
 */
export class SingleQuoteStrategy extends BaseSingleQuoteStrategy {
  readonly strategyName = 'SingleQuoteStrategy' as const

  constructor(intermediateTokensCache?: TTLCache<TokenInfo[]>) {
    super(intermediateTokensCache)
  }

  async execute(
    request: SingleQuoteRequest,
    tradingSdk: TradingSdk,
    providers: DefaultBridgeProvider[],
  ): Promise<CrossChainQuoteAndPost> {
    const { quoteBridgeRequest, advancedSettings } = request
    const { sellTokenChainId, buyTokenChainId } = quoteBridgeRequest

    if (sellTokenChainId !== buyTokenChainId) {
      // Cross-chain swap
      const provider = providers[0]
      if (!provider) {
        throw new Error('No provider found for cross-chain swap')
      }

      const baseParams = {
        swapAndBridgeRequest: quoteBridgeRequest,
        advancedSettings,
        tradingSdk,
        quoteSigner: advancedSettings?.quoteSigner,
        allowIntermediateEqSellToken: advancedSettings?.allowIntermediateEqSellToken,
      } as const

      const request = this.intermediateTokensCache
        ? {
            ...baseParams,
            intermediateTokensCache: this.intermediateTokensCache,
          }
        : baseParams

      return getQuoteWithBridge(provider, request)
    } else {
      // Single-chain swap
      return getQuoteWithoutBridge({
        quoteBridgeRequest,
        advancedSettings,
        tradingSdk,
      })
    }
  }
}
