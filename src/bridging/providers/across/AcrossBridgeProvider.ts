import { Signer } from 'ethers'
import { latest as latestAppData } from '@cowprotocol/app-data'

import {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  BridgingDepositParams,
  QuoteBridgeRequest,
} from '../../types'

import {
  DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION,
  HOOK_DAPP_BRIDGE_PROVIDER_PREFIX,
  RAW_PROVIDERS_FILES_PATH,
} from '../../const'

import { ChainId, ChainInfo, SupportedChainId, TargetChainId } from '../../../chains'

import { EvmCall, TokenInfo } from '../../../common'

import { mainnet } from '../../../chains/details/mainnet'
import { polygon } from '../../../chains/details/polygon'
import { arbitrumOne } from '../../../chains/details/arbitrum'
import { base } from '../../../chains/details/base'
import { optimism } from '../../../chains/details/optimism'
import { AcrossApi, AcrossApiOptions } from './AcrossApi'
import { mapAcrossStatusToBridgeStatus, toBridgeQuoteResult } from './util'
import { CowShedSdk, CowShedSdkOptions } from '../../../cow-shed'
import { createAcrossDepositCall } from './createAcrossDepositCall'
import { OrderKind } from '@cowprotocol/contracts'
import { SuggestedFeesResponse } from './types'
import { getDepositParams } from './getDepositParams'
import { JsonRpcProvider } from '@ethersproject/providers'

type SupportedTokensState = Record<ChainId, Record<string, TokenInfo>>

const HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/across`
export const ACROSS_SUPPORTED_NETWORKS = [mainnet, polygon, arbitrumOne, base, optimism]

// We need to review if we should set an additional slippage tolerance, for now assuming the quote gives you the exact price of bridging and no further slippage is needed
const SLIPPAGE_TOLERANCE_BPS = 0

export interface AcrossBridgeProviderOptions {
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

  private supportedTokens: SupportedTokensState | null = null

  constructor(options: AcrossBridgeProviderOptions = {}) {
    this.api = new AcrossApi(options.apiOptions)
    this.cowShedSdk = new CowShedSdk(options.cowShedOptions)
  }

  info: BridgeProviderInfo = {
    name: 'Across',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/across/across-logo.png`,
    dappId: HOOK_DAPP_ID,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return ACROSS_SUPPORTED_NETWORKS
  }

  async getBuyTokens(targetChainId: TargetChainId): Promise<TokenInfo[]> {
    return Object.values((await this.getSupportedTokensState())[targetChainId] || {})
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    if (request.kind !== OrderKind.SELL) {
      throw new Error('Only SELL is supported for now')
    }

    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request

    const supportedTokensState = await this.getSupportedTokensState()
    const buyTokenAddressLower = buyTokenAddress.toLowerCase()

    const sourceTokens = supportedTokensState[sellTokenChainId]
    const targetTokens = supportedTokensState[buyTokenChainId]

    // Find the token symbol for the target token
    const targetTokenSymbol = targetTokens && targetTokens[buyTokenAddressLower]?.symbol?.toLowerCase()
    if (!targetTokenSymbol) return []

    // Use the tokenSymbol to find the outputToken in the target chain
    return Object.values(sourceTokens || {}).filter((token) => token.symbol?.toLowerCase() === targetTokenSymbol)
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

  async getSignedHook(
    chainId: SupportedChainId,
    unsignedCall: EvmCall,
    signer: Signer,
    defaultGasLimit?: bigint,
  ): Promise<BridgeHook> {
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
      defaultGasLimit,
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

  async decodeBridgeHook(_hook: latestAppData.CoWHook): Promise<BridgeDeposit> {
    throw new Error('Not implemented')
  }

  async getBridgingParams(
    chainId: ChainId,
    provider: JsonRpcProvider,
    orderUid: string,
    txHash: string,
  ): Promise<BridgingDepositParams | null> {
    const txReceipt = await provider.getTransactionReceipt(txHash)

    return getDepositParams(chainId, orderUid, txReceipt)
  }

  getExplorerUrl(bridgingId: string): string {
    // TODO: Review with across how we get the explorer url based on the bridgingId
    return `https://app.across.to/transactions/${bridgingId}`
  }

  async getStatus(bridgingId: string, originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    const depositStatus = await this.api.getDepositStatus({
      originChainId: originChainId.toString(),
      depositId: bridgingId,
    })

    return {
      status: mapAcrossStatusToBridgeStatus(depositStatus.status),
    }
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  private async getSupportedTokensState(): Promise<SupportedTokensState> {
    if (!this.supportedTokens) {
      this.supportedTokens = (await this.api.getSupportedTokens()).reduce((acc, val) => {
        acc[val.chainId] = acc[val.chainId] || {}

        acc[val.chainId][val.address.toLowerCase()] = val

        return acc
      }, {} as SupportedTokensState)
    }

    return this.supportedTokens
  }
}
