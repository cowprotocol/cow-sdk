/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  QuoteAndPost,
  SwapAdvancedSettings,
  TradeParameters,
  TraderParameters,
  TradingSdk,
  TradingSdkOptions,
} from '../trading'
import {
  BridgeProvider,
  BridgeQuoteResult,
  GetBuyTokensParams,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from './types'
import { ALL_SUPPORTED_CHAINS, TokenInfo } from '../common'
import { ChainInfo, TargetChainId } from '../chains'
import { getSigner } from '../common/utils/wallet'
import { MetadataApi } from '@cowprotocol/app-data'
import { getHookMockForCostEstimation } from '../hooks/utils'

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
   * Get quote for bridging tokens between chains.
   *
   * @throws Error if no path is found
   */
  async getQuote(
    quoteBridgeRequest: QuoteBridgeRequest,
    advancedSettings?: SwapAdvancedSettings
  ): Promise<QuoteAndPost> {
    const { sellTokenChainId, sellTokenAddress, appCode, amount, signer: signerLike, ...rest } = quoteBridgeRequest
    const intermediateTokens = await this.provider.getIntermediateTokens(quoteBridgeRequest)

    if (intermediateTokens.length === 0) {
      throw new Error('No path found')
    }

    // We just pick the first intermediate token for now
    const intermediateTokenAddress = intermediateTokens[0]

    // Get intermediate token decimals
    const intermediaryTokenDecimals = await this.config.getErc20Decimals(sellTokenChainId, intermediateTokenAddress)

    // Get the gas limit estimation for the hook
    const bridgeQuoteRequestWithoutAmount: QuoteBridgeRequestWithoutAmount = {
      ...quoteBridgeRequest,
      sellTokenAddress: intermediateTokenAddress,
      sellTokenDecimals: intermediaryTokenDecimals,
    }
    const gasLimit = this.provider.getGasLimitEstimationForHook(bridgeQuoteRequestWithoutAmount)

    // Get the hook mock for cost estimation
    const hookMock = getHookMockForCostEstimation(gasLimit)

    // Estimate the expected amount of intermediate tokens we receive in CoW Protocol
    const swapParams: TradeParameters = {
      ...rest,
      sellToken: sellTokenAddress,
      buyToken: intermediateTokenAddress,
      buyTokenDecimals: intermediaryTokenDecimals,
      amount: amount.toString(),
      partiallyFillable: false, // Fill or Kill
    }
    const tradingSdk = this.config.tradingSdkFactory({ chainId: sellTokenChainId, appCode, signer: signerLike }, {})
    const swapQuote = await tradingSdk.getQuoteResults(swapParams, {
      ...advancedSettings,
      appData: {
        metadata: {
          hooks: hookMock,
        },
      },
    })
    const intermediateTokenAmount = swapQuote.amountsAndCosts.afterSlippage.buyAmount // Estimated, as

    // Get the quote for the bridging of the intermediate token to the final token
    const bridgingQuote = await this.provider.getQuote({
      ...bridgeQuoteRequestWithoutAmount,
      amount: intermediateTokenAmount,
    })

    // Get the bridging call
    const unsignedBridgeCall = await this.provider.getUnsignedBridgeCall(quoteBridgeRequest, bridgingQuote)

    // Get the pre-authorized hook
    const signer = getSigner(signerLike)
    const bridgeHook = await this.provider.getSignedHook(
      quoteBridgeRequest.sellTokenChainId,
      unsignedBridgeCall,
      signer
    )

    // Define trade parameters. Sell sell token for intermediary token, to be received by cow-shed
    const parameters: TradeParameters = {
      ...swapParams,
      receiver: bridgeHook.recipient,
    }

    const metadataApi = new MetadataApi()

    const appData = await metadataApi.generateAppDataDoc({
      ...swapQuote.appDataInfo.doc,
      metadata: {
        hooks: {
          post: [bridgeHook.postHook],
        },
      },
    })

    return tradingSdk.getQuote(parameters, { appData })

    // TODO: Review for final implementation. Its possible we don't want to do the second quote if we trust the first estimation, we can re-use it and calculate create the postSwapOrderFromQuote method
    // TODO: Uncomment the following code if we want to re-use the quote.
    //   const overallQuoteResults = toQuoteResultsFromQuotes({
    //     quoteBridgeRequest: quoteBridgeRequest,
    //     bridgeQuote: bridgingQuote,
    //     swapQuote: swapQuote,
    //     bridgeHook: bridgeHook,
    //   })

    //   return {
    //     quoteResults: overallQuoteResults,
    //     postSwapOrderFromQuote: () => {
    //       postSwapOrderFromQuote({
    //         ...overallQuoteResults,
    //         result: {
    //           signer,
    //           // quoteResults: overallQuoteResults,
    //           orderBookApi,
    //           tradeParameters: getTradeParametersAfterQuote({
    //             quoteParameters: overallQuoteResults.tradeParameters,
    //             orderParameters: swapParams,
    //           }),
    //         },
    //       })
    //     },
    //   }
  }
}

// function toQuoteResultsFromQuotes(quoteResults: {
//   quoteBridgeRequest: QuoteBridgeRequest
//   bridgeQuote: BridgeQuoteResult
//   swapQuote: QuoteResults
//   bridgeHook: BridgeHook
// }): QuoteResults {
//   const { quoteBridgeRequest, bridgeQuote, swapQuote, bridgeHook } = quoteResults

//   // TODO: Use hook in appData!

//   return {
//     amountsAndCosts: {
//       sellAmount: quoteBridgeRequest.amount,
//       buyAmount: bridgeQuote.buyAmount,
//       afterSlippage: {
//         sellAmount: quoteBridgeRequest.amount,
//         buyAmount: bridgeQuote.buyAmount,
//       },
//       // Include other costs from intermediate and final quotes as needed
//     },
//     appDataInfo: swapQuote.appDataInfo,
//     tradeParameters: quoteBridgeRequest,
//     orderToSign: swapQuote.orderToSign,
//     quoteResponse: swapQuote.quoteResponse,
//     orderTypedData: swapQuote.orderTypedData,
//   }
// }
