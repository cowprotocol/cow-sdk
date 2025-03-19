import { SwapAdvancedSettings, TraderParameters, TradingSdk, TradingSdkOptions } from '../../trading'
import {
  BridgeProvider,
  BridgeQuoteResult,
  CrossChainQuoteAndPost,
  GetBuyTokensParams,
  QuoteBridgeRequest,
} from '../types'
import { ALL_SUPPORTED_CHAINS, TokenInfo } from '../../common'
import { ChainInfo, TargetChainId } from '../../chains'
import { getQuoteWithoutBridge } from './getQuoteWithoutBridge'
import { getQuoteWithBridge } from './getQuoteWithBridging'

export interface BridgingSdkOptions {
  getErc20Decimals(chainId: TargetChainId, tokenAddress: string): Promise<number>
  tradingSdkFactory?: (traderParams: TraderParameters, options: Partial<TradingSdkOptions>) => TradingSdk // TODO: I think tradingSDK should not require traderParams, so we should use the same instance no matter the chains. I consider this out of the scope in this PR so I will focus on making bridging SDK to allow to handle all chains with the same instance

  /**
   * Providers for the bridging.
   */
  providers: BridgeProvider<BridgeQuoteResult>[]
}

export type BridgingSdkConfig = Required<BridgingSdkOptions>

/**
 * SDK for bridging for swapping tokens between different chains.
 */
export class BridgingSdk {
  protected config: BridgingSdkConfig
  constructor(readonly options: BridgingSdkOptions) {
    const { providers, tradingSdkFactory, ...restOptions } = options

    // For simplicity, we support only a single provider in the initial implementation
    if (!providers || providers.length !== 1) {
      throw new Error('Current implementation only supports a single bridge provider')
    }

    this.config = {
      providers,
      ...restOptions,
      tradingSdkFactory: tradingSdkFactory ?? ((tradeParams, options) => new TradingSdk(tradeParams, options)),
    }
  }

  private get provider(): BridgeProvider<BridgeQuoteResult> {
    const { providers } = this.config

    return providers[0]
  }

  /**
   * Get the providers for the bridging.
   */
  getProviders(): BridgeProvider<BridgeQuoteResult>[] {
    return this.config.providers
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
   * Get quote details, including a callback function to post the order on-chain.
   *
   * This method support both, cross-chain swaps and single-chain swap.
   *
   * @throws Error if no path is found
   */
  async getQuote(
    quoteBridgeRequest: QuoteBridgeRequest,
    advancedSettings?: SwapAdvancedSettings
  ): Promise<CrossChainQuoteAndPost> {
    const { sellTokenChainId, buyTokenChainId, appCode, signer } = quoteBridgeRequest
    const tradingSdk = this.config.tradingSdkFactory({ chainId: sellTokenChainId, appCode, signer }, {})

    if (sellTokenChainId !== buyTokenChainId) {
      // Cross-chain swap
      return getQuoteWithBridge({
        quoteBridgeRequest,
        advancedSettings,
        tradingSdk,
        provider: this.provider,
        getErc20Decimals: this.config.getErc20Decimals,
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
