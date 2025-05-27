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
import { BungeeBuildTx, BungeeQuote, BungeeQuoteAPIRequest } from './types'
import { getSigner } from 'src/common/utils/wallet'

const HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/bungee`
export const BUNGEE_SUPPORTED_NETWORKS = [mainnet, polygon, arbitrumOne, base, optimism]

/** There will be no dex swaps happening while bridging. Hence slippage will be zero */
const SLIPPAGE_TOLERANCE_BPS = 0

export interface BungeeBridgeProviderOptions {
  /**
   * Token info provider
   * @param chainId - The chain ID
   * @param addresses - The addresses of the tokens to get the info for
   * @returns The token infos
   */
  getTokenInfos?: (chainId: ChainId, addresses: string[]) => Promise<TokenInfo[]>

  // API options
  apiOptions?: BungeeApiOptions

  // Cow-shed options
  cowShedOptions?: CowShedSdkOptions
}

export interface BungeeQuoteResult extends BridgeQuoteResult {
  bungeeQuote: BungeeQuote
  buildTx: BungeeBuildTx
}

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
    if (!this.options.getTokenInfos) {
      throw new Error("'getTokenInfos' parameter is required for BungeeBridgeProvider constructor")
    }

    const chainConfig = BUNGEE_TOKEN_MAPPING[targetChainId as TargetChainId]
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

    // if target token is native token, use weth as intermediate token
    if (targetTokenSymbol === 'eth') {
      const wethAddress = getTokenAddress('weth', sourceChainConfig)
      return wethAddress ? [wethAddress] : []
    }

    // Use the tokenSymbol to find the outputToken in the target chain
    const intermediateToken = getTokenAddress(targetTokenSymbol, sourceChainConfig)
    return intermediateToken ? [intermediateToken] : []
  }

  async getQuote(request: QuoteBridgeRequest): Promise<BungeeQuoteResult> {
    // @note sellTokenAddress here will be the intermediate token in usage. the naming might be a bit misleading
    //       see getQuoteWithBridge.ts::getBaseBridgeQuoteRequest()
    const { sellTokenAddress, sellTokenChainId, buyTokenChainId, buyTokenAddress, amount, receiver, account, owner } =
      request

    // @note bungee api requires the sender address. sender address would be the cowshed account
    // fetch the cowshed account
    const ownerAddress = owner ?? account
    const cowshedAccount = this.cowShedSdk.getCowShedAccount(sellTokenChainId, ownerAddress)

    // fetch quote from bungee api
    const bungeeQuoteRequest: BungeeQuoteAPIRequest = {
      userAddress: cowshedAccount,
      originChainId: sellTokenChainId.toString(),
      destinationChainId: buyTokenChainId.toString(),
      inputToken: sellTokenAddress, // use intermediate token for the bridging quote
      inputAmount: amount.toString(),
      receiverAddress: receiver ?? account, // receiver is required on bungee api
      outputToken: buyTokenAddress,
      includeBridges: this.api.SUPPORTED_BRIDGES,
      enableManual: true,
      disableSwapping: true,
      disableAuto: true,
    }
    const quoteWithBuildTx = await this.api.getBungeeQuoteWithBuildTx(bungeeQuoteRequest)

    // verify build-tx data
    const isBuildTxValid = await this.api.verifyBungeeBuildTx(
      quoteWithBuildTx.bungeeQuote,
      quoteWithBuildTx.buildTx,
      getSigner(request.signer),
    )
    if (!isBuildTxValid) {
      throw new Error('Build tx data is invalid')
    }

    // convert bungee quote response to BridgeQuoteResult
    return toBridgeQuoteResult(request, SLIPPAGE_TOLERANCE_BPS, quoteWithBuildTx)
  }

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: BungeeQuoteResult): Promise<EvmCall> {
    return createBungeeDepositCall({
      request,
      quote,
      cowShedSdk: this.cowShedSdk,
    })
  }

  getGasLimitEstimationForHook(_request: QuoteBridgeRequest): number {
    // TODO sim and replace gas limit
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
