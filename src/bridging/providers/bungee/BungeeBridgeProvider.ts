import { Signer } from 'ethers'
import { latest as latestAppData } from '@cowprotocol/app-data'

import {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  QuoteBridgeRequest,
} from '../../types'

import { DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION, RAW_PROVIDERS_FILES_PATH } from '../../const'

import { ChainId, ChainInfo, SupportedChainId, TargetChainId } from '../../../chains'

import { BUNGEE_TOKEN_MAPPING } from './const/tokens'
import { EvmCall, TokenInfo } from '../../../common'

import { mainnet } from '../../../chains/details/mainnet'
import { polygon } from '../../../chains/details/polygon'
import { arbitrumOne } from '../../../chains/details/arbitrum'
import { base } from '../../../chains/details/base'
import { optimism } from '../../../chains/details/optimism'
import { BungeeApi, BungeeApiOptions } from './BungeeApi'
import { getChainConfigs, getTokenAddress, getTokenSymbol, toBridgeQuoteResult } from './util'
import { CowShedSdk, CowShedSdkOptions } from '../../../cow-shed'
import { createBungeeDepositCall } from './createBungeeDepositCall'
import { OrderKind } from '@cowprotocol/contracts'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from './const/misc'

const HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/bungee`
export const BUNGEE_SUPPORTED_NETWORKS = [mainnet, polygon, arbitrumOne, base, optimism]

export interface BungeeBridgeProviderOptions {
  // API options
  apiOptions?: BungeeApiOptions

  // Cow-shed options
  cowShedOptions?: CowShedSdkOptions
}

export interface BungeeQuoteResult extends BridgeQuoteResult {}

export class BungeeBridgeProvider implements BridgeProvider<BungeeQuoteResult> {
  protected api: BungeeApi
  protected cowShedSdk: CowShedSdk

  constructor(private options: BungeeBridgeProviderOptions = {}) {
    this.api = new BungeeApi(options.apiOptions)
    this.cowShedSdk = new CowShedSdk(options.cowShedOptions)
  }

  info: BridgeProviderInfo = {
    name: 'Bungee',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/bungee/bungee-logo.png`,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return BUNGEE_SUPPORTED_NETWORKS
  }

  async getBuyTokens(targetChainId: TargetChainId): Promise<TokenInfo[]> {
    const chainConfig = BUNGEE_TOKEN_MAPPING[targetChainId as TargetChainId]
    if (!chainConfig) {
      return []
    }

    const tokenAddresses = Object.values(chainConfig.tokens).filter((address): address is string => Boolean(address))

    // TODO use an api to get token details
    throw new Error('TODO use an api to get token details')
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

  async getQuote(request: QuoteBridgeRequest): Promise<BungeeQuoteResult> {
    // TODO implement
    throw new Error('TODO implement')
  }

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: BungeeQuoteResult): Promise<EvmCall> {
    return createBungeeDepositCall({
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
        dappId: HOOK_DAPP_ID,
      },
      recipient: cowShedAccount,
    }
  }

  async decodeBridgeHook(_hook: latestAppData.CoWHook): Promise<BridgeDeposit> {
    throw new Error('Not implemented')
  }

  async getBridgingId(_orderUid: string, _settlementTx: string, _logIndex: number): Promise<string> {
    // order uid itself can be used as bridging id on Bungee
    return _orderUid
  }

  getExplorerUrl(bridgingId: string): string {
    return `https://socketscan.io/tx/${bridgingId}`
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
