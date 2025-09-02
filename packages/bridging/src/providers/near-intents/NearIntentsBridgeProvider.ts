import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { arbitrumOne, avalanche, base, bnb, gnosisChain, mainnet, optimism, polygon } from '@cowprotocol/sdk-config'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { NearIntentsApi } from './NearIntentsApi'

import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX, RAW_PROVIDERS_FILES_PATH } from '../../const'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'

import type { cowAppDataLatestScheme as latestAppData } from '@cowprotocol/sdk-app-data'
import type { AbstractProviderAdapter, SignerLike } from '@cowprotocol/sdk-common'
import type { ChainId, ChainInfo, EvmCall, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import type { CowShedSdkOptions } from '@cowprotocol/sdk-cow-shed'
import type {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
} from '../../types'
import { QuoteRequest, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'
import { zeroAddress } from 'viem'

export interface NearIntentsQuoteResult extends BridgeQuoteResult {}

export const NEAR_INTENTS_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/near-intents`

export const NEAR_INTENTS_SUPPORTED_NETWORKS = [
  arbitrumOne,
  avalanche,
  base,
  bnb,
  gnosisChain,
  mainnet,
  optimism,
  polygon,
]

export const NEAR_BLOCKCHAIN_TO_COW_NETWORK: Record<string, ChainInfo> = {
  eth: mainnet,
  arb: arbitrumOne,
  gnosis: gnosisChain,
  pol: polygon,
  bsc: bnb,
  base,
  op: optimism,
  avax: avalanche,
}

export interface NearIntentsBridgeProviderOptions {
  cowShedOptions?: CowShedSdkOptions
}

const adaptTokens = (tokens: TokenResponse[]): TokenInfo[] =>
  tokens.reduce<TokenInfo[]>((acc, token) => {
    const network = NEAR_BLOCKCHAIN_TO_COW_NETWORK[token.blockchain]
    if (!network) return acc
    acc.push({
      chainId: network.id,
      decimals: token.decimals,
      address: token.contractAddress || zeroAddress,
      name: token.symbol, // TODO: how to handle? v0/tokens doesn't return the token name
      symbol: token.symbol,
    })
    return acc
  }, [])

export class NearIntentsBridgeProvider implements BridgeProvider<NearIntentsQuoteResult> {
  protected api: NearIntentsApi
  protected cowShedSdk: CowShedSdk

  info: BridgeProviderInfo = {
    name: 'Near Intents',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/near-intents/across-logo.png`, // todo
    dappId: NEAR_INTENTS_HOOK_DAPP_ID,
    website: 'https://www.near.org/intents',
  }

  constructor(options: NearIntentsBridgeProviderOptions, _adapter?: AbstractProviderAdapter) {
    const adapter = _adapter || options.cowShedOptions?.adapter
    if (adapter) {
      setGlobalAdapter(adapter)
    }
    this.api = new NearIntentsApi()
    this.cowShedSdk = new CowShedSdk(adapter, options.cowShedOptions?.factoryOptions)
  }

  async getNetworks(): Promise<ChainInfo[]> {
    // TODO: non evm networks?
    return NEAR_INTENTS_SUPPORTED_NETWORKS
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    const tokens = adaptTokens(await this.api.getTokens())

    return {
      tokens: tokens.filter((token) => token.chainId === params.buyChainId),
      isRouteAvailable: tokens.length > 0,
    }
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    if (request.kind !== OrderKind.SELL) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED, { kind: request.kind })
    }

    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request

    const tokens = adaptTokens(await this.api.getTokens())
    const sourceTokens = tokens.filter((token) => token.chainId === sellTokenChainId)
    const targetTokens = tokens.filter((token) => token.chainId === buyTokenChainId)

    // Check if buyToken is supported
    const buyToken = targetTokens.find((token) => token.address.toLowerCase() === buyTokenAddress.toLowerCase())
    if (!buyToken) return []

    // If buyToken is supported, all source tokens can be used to buy buyToken
    return sourceTokens
  }

  async getQuote(request: QuoteBridgeRequest): Promise<NearIntentsQuoteResult> {
    const {
      slippageBps,
      sellTokenAddress,
      sellTokenChainId,
      buyTokenAddress,
      buyTokenChainId,
      account,
      amount,
      receiver,
      validFor,
    } = request
    const tokens = await this.api.getTokens()

    const getToken = (targetTokenAddress: string, targetTokenChainId: number) => {
      return tokens.find((token) => {
        const network = NEAR_BLOCKCHAIN_TO_COW_NETWORK[token.blockchain]
        return (
          token.contractAddress?.toLowerCase() === targetTokenAddress.toLowerCase() &&
          network &&
          network.id === targetTokenChainId
        )
      })
    }

    const sellToken = getToken(sellTokenAddress, sellTokenChainId)
    if (!sellToken) throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES)

    const buyToken = getToken(buyTokenAddress, buyTokenChainId)
    if (!buyToken) throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES)

    const result = await this.api.getQuote({
      dry: false, // set to true for testing / false to get `depositAddress` and execute swap
      swapType: QuoteRequest.swapType.EXACT_INPUT,
      slippageTolerance: slippageBps || 100, // fallback to 1%
      originAsset: sellToken.assetId,
      depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
      destinationAsset: buyToken.assetId,
      amount: amount.toString(),
      refundTo: account,
      refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
      recipient: receiver || account,
      recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
      deadline: new Date(Date.now() + Number(validFor) * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z'),
    })

    // TODO:
  }

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: NearIntentsQuoteResult): Promise<EvmCall> {
    throw new Error('not implemented')
  }

  async getGasLimitEstimationForHook(
    request: Omit<QuoteBridgeRequest, 'amount'> & { extraGas?: number; extraGasProxyCreation?: number },
  ): Promise<number> {
    throw new Error('not implemented')
  }

  async getSignedHook(
    chainId: SupportedChainId,
    unsignedCall: EvmCall,
    bridgeHookNonce: string,
    deadline: bigint,
    hookGasLimit: number,
    signer?: SignerLike,
  ): Promise<BridgeHook> {
    throw new Error('not implemented')
  }

  decodeBridgeHook(hook: latestAppData.CoWHook): Promise<BridgeDeposit> {
    throw new Error('not implemented')
  }

  getBridgingParams(
    chainId: ChainId,
    orderUid: string,
    txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    throw new Error('not implemented')
  }

  getExplorerUrl(bridgingId: string): string {
    throw new Error('not implemented')
  }

  getStatus(bridgingId: string, originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    throw new Error('not implemented')
  }

  getCancelBridgingTx(bridgingId: string): Promise<EvmCall> {
    throw new Error('not implemented')
  }

  getRefundBridgingTx(bridgingId: string): Promise<EvmCall> {
    throw new Error('not implemented')
  }
}

export default NearIntentsBridgeProvider
