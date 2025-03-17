/* eslint-disable @typescript-eslint/no-unused-vars */
import { Signer } from 'ethers'

import {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  GetBuyTokensParams,
  QuoteBridgeRequest,
} from '../../types'

import { RAW_PROVIDERS_FILES_PATH } from '../../const'

import { ChainId, ChainInfo, TargetChainId } from '../../../chains'

import { acrossTokenMapping } from './const/tokens'
import { EvmCall, TokenInfo } from '../../../common'

import { mainnet } from '../../../chains/details/mainnet'
import { polygon } from '../../../chains/details/polygon'
import { arbitrumOne } from 'src/chains/details/arbitrum'
import { base } from '../../../chains/details/base'
import { optimism } from '../../../chains/details/optimism'
import { AcrossApi, SuggestedFeesResponse } from './acrossApi'
import { getChainConfigs, getTokenAddress, getTokenSymbol, toBridgeQuoteResult } from './util'

interface AcrossBridgeProviderOptions {
  getTokenInfos: (chainId: ChainId, addresses: string[]) => Promise<TokenInfo[]>
  apiBaseUrl?: string
}

export interface AcrossQuoteResult extends BridgeQuoteResult {
  suggestedFees: SuggestedFeesResponse
}

export class AcrossBridgeProvider implements BridgeProvider<AcrossQuoteResult> {
  private api: AcrossApi

  constructor(private options: AcrossBridgeProviderOptions) {
    this.api = new AcrossApi(options.apiBaseUrl)
  }

  info: BridgeProviderInfo = {
    name: 'Across',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/across/across-logo.png`,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return [mainnet, polygon, arbitrumOne, base, optimism]
  }

  async getBuyTokens(param: GetBuyTokensParams): Promise<TokenInfo[]> {
    const { targetChainId } = param

    const chainConfig = acrossTokenMapping[targetChainId as TargetChainId]
    if (!chainConfig) {
      return []
    }

    const tokenAddresses = Object.values(chainConfig.tokens)
    return this.options.getTokenInfos(targetChainId, tokenAddresses)
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<string[]> {
    // TODO: This is a temporary implementation. We should use the Across API to get the intermediate tokens (see this.getAvailableRoutes())
    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request
    const chainConfigs = getChainConfigs(sellTokenChainId, buyTokenChainId)
    if (!chainConfigs) return []

    const { sourceChainConfig, targetChainConfig } = chainConfigs

    // Find the token symbol for the target token
    const targetTokenSymbol = getTokenSymbol(buyTokenAddress, targetChainConfig)
    if (!targetTokenSymbol) return []

    // Use the tokenSymbol to find the outputToken in the target chain
    const intermediateToken = getTokenAddress(targetTokenSymbol, sourceChainConfig)
    return intermediateToken ? [intermediateToken] : []
  }

  async getQuote(request: QuoteBridgeRequest): Promise<AcrossQuoteResult> {
    const { sellTokenAddress, sellTokenChainId, buyTokenChainId, amount, recipient } = request
    const suggestedFees = await this.api.getSuggestedFees({
      token: sellTokenAddress,
      // inputToken: sellTokenAddress,
      // outputToken: buyTokenAddress,
      originChainId: sellTokenChainId.toString(),
      destinationChainId: buyTokenChainId.toString(),
      amount,
      recipient,
    })

    // TODO: The suggested fees contain way more information. As we review more bridge providers we should revisit the
    // facade of the quote result.
    //
    // For example, this contains also information on the limits, so you don't need to quote again for the same pair.
    // potentially, this could be cached for a short period of time in the SDK so we can resolve quotes with less
    // requests.

    return toBridgeQuoteResult(amount, suggestedFees)
  }

  async getUnsignedBridgeTx(_request: QuoteBridgeRequest, _quote: BridgeQuoteResult): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
  async getSignedHook(_unsignedTx: EvmCall, _signer: Signer): Promise<BridgeHook> {
    throw new Error('Not implemented')
  }
  async decodeBridgeHook(_hook: BridgeHook): Promise<BridgeDeposit> {
    throw new Error('Not implemented')
  }

  async getBridgingId(_orderUid: string, _settlementTx: string): Promise<string> {
    throw new Error('Not implemented')
  }

  getExplorerUrl(_bridgingId: string): string {
    throw new Error('Not implemented')
  }

  async getStatus(_bridgingId: string): Promise<BridgeStatusResult> {
    throw new Error('Not implemented')
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
}
