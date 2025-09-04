import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { arbitrumOne, avalanche, base, bnb, gnosisChain, mainnet, optimism, polygon } from '@cowprotocol/sdk-config'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { QuoteRequest } from '@defuse-protocol/one-click-sdk-typescript'
import { encodeFunctionData, erc20Abi, zeroAddress } from 'viem'

import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX, RAW_PROVIDERS_FILES_PATH } from '../../const'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { NearIntentsApi } from './NearIntentsApi'
import { getGasLimitEstimationForHook } from 'providers/utils/getGasLimitEstimationForHook'

import type { cowAppDataLatestScheme as latestAppData } from '@cowprotocol/sdk-app-data'
import type { AbstractProviderAdapter, SignerLike } from '@cowprotocol/sdk-common'
import type { ChainId, ChainInfo, EvmCall, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import type { CowShedSdkOptions } from '@cowprotocol/sdk-cow-shed'
import type { TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'
import type { Hex } from 'viem'
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

export interface NearIntentsQuoteResult extends BridgeQuoteResult {
  depositAddress: Hex
}

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

const calculateDeadline = (seconds: number) => {
  const secs = Number(seconds)
  if (!Number.isFinite(secs)) {
    throw new Error(`Invalid seconds value: ${seconds}`)
  }
  const d = new Date(Date.now() + secs * 1000)
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z')
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

const getTokenByAddressAndChainId = (
  tokens: TokenResponse[],
  targetTokenAddress: string,
  targetTokenChainId: number,
) => {
  return tokens.find((token) => {
    const network = NEAR_BLOCKCHAIN_TO_COW_NETWORK[token.blockchain]
    const tokenAddress = token.contractAddress || zeroAddress
    return (
      tokenAddress.toLowerCase() === targetTokenAddress.toLowerCase() && network && network.id === targetTokenChainId
    )
  })
}

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

    const sellToken = getTokenByAddressAndChainId(tokens, sellTokenAddress, sellTokenChainId)
    const buyToken = getTokenByAddressAndChainId(tokens, buyTokenAddress, buyTokenChainId)
    if (!sellToken || !buyToken) throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES)

    const slippageBps = request.slippageBps || 100 // fallback to 1%

    const { quote, timestamp: isoDate } = await this.api.getQuote({
      dry: false,
      swapType: QuoteRequest.swapType.EXACT_INPUT,
      slippageTolerance: slippageBps,
      originAsset: sellToken.assetId,
      depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
      destinationAsset: buyToken.assetId,
      amount: amount.toString(),
      refundTo: account,
      refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
      recipient: receiver || account,
      recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
      deadline: calculateDeadline(validFor || 3600),
    })

    const slippage = (1 - Number(quote.amountOutUsd) / Number(quote.amountInUsd)) * 100

    return {
      isSell: request.kind === OrderKind.SELL,
      depositAddress: quote.depositAddress as Hex,
      quoteTimestamp: new Date(isoDate).getTime(),
      expectedFillTimeSeconds: quote.timeEstimate,
      limits: {
        minDeposit: BigInt(quote.minAmountIn),
        maxDeposit: BigInt(quote.amountIn),
      },
      fees: {
        bridgeFee: BigInt(0),
        destinationGasFee: BigInt(0),
      },
      amountsAndCosts: {
        beforeFee: {
          sellAmount: BigInt(quote.amountOut),
          buyAmount: BigInt(quote.amountIn),
        },
        afterFee: {
          sellAmount: BigInt(quote.amountOut),
          buyAmount: BigInt(quote.amountIn),
        },
        afterSlippage: {
          sellAmount: BigInt(quote.minAmountOut),
          buyAmount: BigInt(quote.minAmountIn),
        },
        slippageBps: Math.trunc(slippage * 100),
        costs: {
          bridgingFee: {
            feeBps: 0,
            amountInSellCurrency: BigInt(0),
            amountInBuyCurrency: BigInt(0),
          },
        },
      },
    }
  }

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: NearIntentsQuoteResult): Promise<EvmCall> {
    const { sellTokenAddress } = request
    const {
      depositAddress,
      amountsAndCosts: {
        beforeFee: { sellAmount },
      },
    } = quote
    if (sellTokenAddress === zeroAddress) {
      // Send native tokens
      return {
        to: depositAddress,
        value: sellAmount,
        data: '0x',
      }
    } else {
      // Send ERC20 tokens
      return {
        to: sellTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [depositAddress, sellAmount],
        }),
      }
    }
  }

  async getGasLimitEstimationForHook(request: QuoteBridgeRequest): Promise<number> {
    return getGasLimitEstimationForHook({
      cowShedSdk: this.cowShedSdk,
      request,
    })
  }

  async getSignedHook(
    chainId: SupportedChainId,
    unsignedCall: EvmCall,
    bridgeHookNonce: string,
    deadline: bigint,
    hookGasLimit: number,
    signer?: SignerLike,
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
      gasLimit: BigInt(hookGasLimit),
      deadline,
      nonce: bridgeHookNonce,
    })

    const { to, data } = signedMulticall
    return {
      postHook: {
        target: to,
        callData: data,
        gasLimit: gasLimit.toString(),
        dappId: NEAR_INTENTS_HOOK_DAPP_ID,
      },
      recipient: cowShedAccount,
    }
  }

  decodeBridgeHook(hook: latestAppData.CoWHook): Promise<BridgeDeposit> {
    throw new Error('Not implemented')
  }

  async getBridgingParams(
    chainId: ChainId,
    orderUid: string,
    txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    throw new Error('Not implemented')
  }

  getExplorerUrl(bridgingId: string): string {
    return `https://explorer.near-intents.org/transactions/${bridgingId}`
  }

  getStatus(bridgingId: string, originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    throw new Error('Not implemented')
  }

  getCancelBridgingTx(bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  getRefundBridgingTx(bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
}

export default NearIntentsBridgeProvider
