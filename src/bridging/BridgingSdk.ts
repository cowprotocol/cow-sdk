/* eslint-disable @typescript-eslint/no-unused-vars */
import { QuoteAndPost, TraderParameters } from '../trading'
import { BridgeProvider, BridgeQuoteResult, GetBuyTokensParams, QuoteBridgeRequest } from './types'
import { ALL_SUPPORTED_CHAINS, TokenInfo } from '../common'
import type { ChainInfo } from '../chains'
export interface BridgingSdkOptions {
  /**
   * Providers for the bridging.
   */
  providers: BridgeProvider<BridgeQuoteResult>[]
}

/**
 * SDK for bridging for swapping tokens between different chains.
 */
export class BridgingSdk {
  constructor(public readonly traderParams: TraderParameters, public readonly options: BridgingSdkOptions) {
    const { providers } = this.options

    // For simplicity, we support only a single provider in the initial implementation
    if (!providers || providers.length !== 1) {
      throw new Error('Current implementation only supports a single bridge provider')
    }
  }

  private get provider(): BridgeProvider<BridgeQuoteResult> {
    const { providers } = this.options

    return providers[0]
  }

  /**
   * Get the providers for the bridging.
   */
  getProviders(): BridgeProvider<BridgeQuoteResult>[] {
    return this.options.providers
  }

  /**
   * Get the available sources networks for the bridging.
   */
  async getSourceNetworks(): Promise<ChainInfo[]> {
    return ALL_SUPPORTED_CHAINS
  }

  /**
   * Get the available target networks for the bridging.
   */
  async getTargetNetworks(): Promise<ChainInfo[]> {
    return this.provider.getNetworks()
  }

  /**
   * Get the available buy tokens for buying in a specific target chain
   *
   * @param param
   * @returns
   */
  async getBuyTokens(param: GetBuyTokensParams): Promise<TokenInfo[]> {
    return this.provider.getBuyTokens(param)
  }

  /**
   * Get quote for bridging tokens between chains.
   */
  async getQuote(_params: QuoteBridgeRequest): Promise<QuoteAndPost> {
    throw new Error('Not implemented yet!')
  }
}
