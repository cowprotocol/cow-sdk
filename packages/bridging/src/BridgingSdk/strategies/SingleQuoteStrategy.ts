import { CrossChainQuoteAndPost } from '../../types'
import { getQuoteWithoutBridge } from '../getQuoteWithoutBridge'
import { getQuoteWithBridge } from '../getQuoteWithBridge'
import { BridgingSdkConfig } from '../types'
import { SingleQuoteStrategy, SingleQuoteRequest } from './QuoteStrategy'

/**
 * Strategy for getting a single quote (handles both cross-chain and single-chain)
 */
export class SingleQuoteStrategyImpl implements SingleQuoteStrategy {
  readonly strategyName = 'SingleQuoteStrategy'

  async execute(request: SingleQuoteRequest, config: BridgingSdkConfig): Promise<CrossChainQuoteAndPost> {
    const { quoteBridgeRequest, advancedSettings } = request
    const { sellTokenChainId, buyTokenChainId } = quoteBridgeRequest
    const { tradingSdk, providers } = config

    if (sellTokenChainId !== buyTokenChainId) {
      // Cross-chain swap
      const provider = providers[0]
      if (!provider) {
        throw new Error('No provider found for cross-chain swap')
      }

      return getQuoteWithBridge({
        swapAndBridgeRequest: quoteBridgeRequest,
        advancedSettings,
        tradingSdk,
        provider,
        bridgeHookSigner: advancedSettings?.quoteSigner,
      })
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
