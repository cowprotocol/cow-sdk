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

import { DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION, RAW_PROVIDERS_FILES_PATH } from '../../const'

import { ChainId, ChainInfo, SupportedChainId, TargetChainId } from '../../../chains'

import { ACROSS_TOKEN_MAPPING } from './const/tokens'
import { EvmCall, TokenInfo } from '../../../common'

import { mainnet } from '../../../chains/details/mainnet'
import { polygon } from '../../../chains/details/polygon'
import { arbitrumOne } from '../../../chains/details/arbitrum'
import { base } from '../../../chains/details/base'
import { optimism } from '../../../chains/details/optimism'
import { AcrossApi, AcrossApiOptions, SuggestedFeesResponse } from './AcrossApi'
import { getChainConfigs, getTokenAddress, getTokenSymbol, toBridgeQuoteResult } from './util'
import { CowShedSdk, CowShedSdkOptions } from '../../../cow-shed'
import { createAcrossDepositCall } from './createAcrossDepositCall'
import { OrderKind } from '@cowprotocol/contracts'

const HOOK_DAPP_ID = 'cow-sdk://bridging/providers/across'
export const ACROSS_SUPPORTED_NETWORKS = [mainnet, polygon, arbitrumOne, base, optimism]

// We need to review if we should set an additional slippage tolerance, for now assuming the quote gives you the exact price of bridging and no further slippage is needed
const SLIPPAGE_TOLERANCE_BPS = 0
export interface AcrossBridgeProviderOptions {
  /**
   * Token info provider
   * @param chainId - The chain ID
   * @param addresses - The addresses of the tokens to get the info for
   * @returns The token infos
   */
  getTokenInfos?: (chainId: ChainId, addresses: string[]) => Promise<TokenInfo[]>

  // API options
  apiOptions?: AcrossApiOptions

  // Cow-shed options
  cowShedOptions?: CowShedSdkOptions
}

export interface AcrossQuoteResult extends BridgeQuoteResult {
  suggestedFees: SuggestedFeesResponse
}

export class AcrossBridgeProvider implements BridgeProvider<AcrossQuoteResult> {
  protected api: AcrossApi
  protected cowShedSdk: CowShedSdk

  constructor(private options: AcrossBridgeProviderOptions = {}) {
    this.api = new AcrossApi(options.apiOptions)
    this.cowShedSdk = new CowShedSdk(options.cowShedOptions)
  }

  info: BridgeProviderInfo = {
    name: 'Across',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/across/across-logo.png`,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return ACROSS_SUPPORTED_NETWORKS
  }

  async getBuyTokens(param: GetBuyTokensParams): Promise<TokenInfo[]> {
    if (!this.options.getTokenInfos) {
      throw new Error("'getTokenInfos' parameter is required for AcrossBridgeProvider constructor")
    }

    const { targetChainId } = param

    const chainConfig = ACROSS_TOKEN_MAPPING[targetChainId as TargetChainId]
    if (!chainConfig) {
      return []
    }

    const tokenAddresses = Object.values(chainConfig.tokens).filter((address): address is string => Boolean(address))
    return this.options.getTokenInfos(targetChainId, tokenAddresses)
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<string[]> {
    if (request.kind !== OrderKind.SELL) {
      throw new Error('Only SELL is supported for now')
    }

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
    const { sellTokenAddress, sellTokenChainId, buyTokenChainId, amount, receiver } = request

    const suggestedFees = await this.api.getSuggestedFees({
      token: sellTokenAddress,
      // inputToken: sellTokenAddress,
      // outputToken: buyTokenAddress,
      originChainId: sellTokenChainId,
      destinationChainId: buyTokenChainId,
      amount,
      recipient: receiver ?? undefined,
    })

    // TODO: The suggested fees contain way more information. As we review more bridge providers we should revisit the
    // facade of the quote result.
    //
    // For example, this contains also information on the limits, so you don't need to quote again for the same pair.
    // potentially, this could be cached for a short period of time in the SDK so we can resolve quotes with less
    // requests.

    return toBridgeQuoteResult(request, SLIPPAGE_TOLERANCE_BPS, suggestedFees)
  }

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: AcrossQuoteResult): Promise<EvmCall> {
    return createAcrossDepositCall({
      request,
      quote,
      cowShedSdk: this.cowShedSdk,
    })
  }

  getGasLimitEstimationForHook(_request: QuoteBridgeRequest): number {
    return DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION
  }

  async getSignedHook(chainId: SupportedChainId, unsignedCall: EvmCall, signer: Signer): Promise<BridgeHook> {
    // Sign the multicall
    const { signedMulticall, cowShedAccount, gasLimit } = await this.cowShedSdk.signCalls({
      calls: [
        {
          target: unsignedCall.to,
          value: unsignedCall.value,
          callData: unsignedCall.data,
          allowFailure: false,
          isDelegateCall: true,
        },
      ],
      chainId,
      signer,
    })

    const { to, data } = signedMulticall
    return {
      postHook: {
        target: to,
        callData: data,
        gasLimit: gasLimit.toString(),
        dappId: HOOK_DAPP_ID, // TODO: I think we should have some additional parameter to type the hook (using dappId for now)
      },
      recipient: cowShedAccount,
    }
  }

  async decodeBridgeHook(_hook: BridgeHook): Promise<BridgeDeposit> {
    throw new Error('Not implemented')
  }

  async getBridgingId(_orderUid: string, _settlementTx: string): Promise<string> {
    // TODO: get events from the mined transaction, extract the deposit id
    throw new Error('Not implemented')
  }

  getExplorerUrl(bridgingId: string): string {
    // TODO: Review with across how we get the explorer url based on the bridgingId
    return `https://app.across.to/transactions/${bridgingId}`
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
