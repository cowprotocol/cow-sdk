import { SwapAdvancedSettings, TradingSdk } from '../../trading'
import {
  BridgeProvider,
  BridgeQuoteResult,
  CrossChainQuoteAndPost,
  GetErc20Decimals,
  QuoteBridgeRequest,
} from '../types'
import { ALL_SUPPORTED_CHAINS, TokenInfo } from '../../common'
import { ChainInfo, TargetChainId } from '../../chains'
import { getQuoteWithoutBridge } from './getQuoteWithoutBridge'
import { getQuoteWithBridge } from './getQuoteWithBridging'
import { getSigner } from '../../common/utils/wallet'
import { factoryGetErc20Decimals } from './getErc20Decimals'
import { enableLogging } from '../../common/utils/log'

export interface BridgingSdkOptions {
  /**
   * Providers for the bridging.
   */
  providers: BridgeProvider<BridgeQuoteResult>[]

  /**
   * Function to get the decimals of the ERC20 tokens
   */
  getErc20Decimals?: GetErc20Decimals

  /**
   * Trading SDK.
   */
  tradingSdk?: TradingSdk

  /**
   * Enable logging for the bridging SDK.
   */
  enableLogging?: boolean
}

export type BridgingSdkConfig = Required<Omit<BridgingSdkOptions, 'enableLogging' | 'getErc20Decimals'>> &
  Pick<BridgingSdkOptions, 'getErc20Decimals'>

/**
 * SDK for bridging for swapping tokens between different chains.
 */
export class BridgingSdk {
  protected config: BridgingSdkConfig
  constructor(readonly options: BridgingSdkOptions) {
    const { providers, tradingSdk, ...restOptions } = options

    // For simplicity, we support only a single provider in the initial implementation
    if (!providers || providers.length !== 1) {
      throw new Error('Current implementation only supports a single bridge provider')
    }

    if (options.enableLogging !== undefined) {
      enableLogging(options.enableLogging)
    }

    this.config = {
      providers,
      ...restOptions,
      tradingSdk: tradingSdk ?? new TradingSdk(),
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
  async getBuyTokens(targetChainId: TargetChainId): Promise<TokenInfo[]> {
    return this.provider.getBuyTokens(targetChainId)
  }

  /**
   * Get quote details, including a callback function to post the order on-chain.
   *
   * This method support both, cross-chain swaps and single-chain swap.
   *
   * The return type will be either `QuoteAndPost` or `BridgeQuoteAndPost`.
   *
   * To safely assert the type in Typescript, you can use:
   * - `isBridgeQuoteAndPost(result)` utility.
   * - `isQuoteAndPost(result)` utility.
   * - `assertIsBridgeQuoteAndPost(result)` assertion.
   * - `assertIsQuoteAndPost(result)` assertion.
   *
   * @throws Error if no path is found
   */
  async getQuote(
    quoteBridgeRequest: QuoteBridgeRequest,
    advancedSettings?: SwapAdvancedSettings
  ): Promise<CrossChainQuoteAndPost> {
    const { sellTokenChainId, buyTokenChainId } = quoteBridgeRequest
    const tradingSdk = this.config.tradingSdk

    if (sellTokenChainId !== buyTokenChainId) {
      const signer = getSigner(quoteBridgeRequest.signer)
      const getErc20Decimals = this.config.getErc20Decimals ?? factoryGetErc20Decimals(signer)

      // Cross-chain swap
      return getQuoteWithBridge({
        swapAndBridgeRequest: quoteBridgeRequest,
        advancedSettings,
        tradingSdk,
        provider: this.provider,
        getErc20Decimals,
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
