import { QuoteAndPost, TraderParameters } from '../../trading'
import { BridgeProvider, BridgeQuoteResult, GetBuyTokensParams, QuoteBridgeRequest } from '../types'
import { ALL_SUPPORTED_CHAINS, ChainInfo, TokenInfo } from '../../common'

export interface BridgingSdkOptions {
  providers: BridgeProvider<BridgeQuoteResult>[]
}

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

  getProviders(): BridgeProvider<BridgeQuoteResult>[] {
    return this.options.providers
  }

  async getSourceNetworks(): Promise<ChainInfo[]> {
    return ALL_SUPPORTED_CHAINS
  }

  getTargetNetworks(): Promise<ChainInfo[]> {
    return this.provider.getNetworks()
  }

  getBuyTokens(param: GetBuyTokensParams): Promise<TokenInfo[]> {
    return this.provider.getBuyTokens(param)
  }

  getQuote(_params: QuoteBridgeRequest): Promise<QuoteAndPost> {
    throw new Error('Not implemented yet!')
  }
}
