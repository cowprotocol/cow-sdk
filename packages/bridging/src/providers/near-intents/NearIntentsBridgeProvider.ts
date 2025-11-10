import { getGlobalAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'
import { ETH_ADDRESS } from '@cowprotocol/sdk-config'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { OrderKind, EnrichedOrder } from '@cowprotocol/sdk-order-book'
import { QuoteRequest } from '@defuse-protocol/one-click-sdk-typescript'
import { BridgeStatus } from '../../types'
import { concat, getAddress, hexToBytes, isHex, keccak256, recoverAddress } from 'viem'

import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX, RAW_PROVIDERS_FILES_PATH } from '../../const'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { NearIntentsApi } from './NearIntentsApi'
import {
  ATTESTATION_PREFIX_CONST,
  ATTESTATOR_ADDRESS,
  ATTESTION_VERSION_BYTE,
  NEAR_INTENTS_STATUS_TO_COW_STATUS,
  NEAR_INTENTS_SUPPORTED_NETWORKS,
} from './const'
import { adaptToken, adaptTokens, calculateDeadline, getTokenByAddressAndChainId, hashQuote } from './util'

import type { QuoteResponse } from '@defuse-protocol/one-click-sdk-typescript'
import type { AbstractProviderAdapter } from '@cowprotocol/sdk-common'
import type { ChainId, ChainInfo, EvmCall, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import type { CowShedSdkOptions } from '@cowprotocol/sdk-cow-shed'
import type { Address, Hex } from 'viem'
import type {
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
  ReceiverAccountBridgeProvider,
} from '../../types'

export const NEAR_INTENTS_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/near-intents`
export const REFERRAL = 'cow'

export interface NearIntentsQuoteResult extends BridgeQuoteResult {
  depositAddress: Hex
}

export interface NearIntentsBridgeProviderOptions {
  cowShedOptions?: CowShedSdkOptions
}

export class NearIntentsBridgeProvider implements ReceiverAccountBridgeProvider<NearIntentsQuoteResult> {
  type = 'ReceiverAccountBridgeProvider' as const

  protected api: NearIntentsApi
  protected cowShedSdk: CowShedSdk

  info: BridgeProviderInfo = {
    name: 'Near Intents',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/near-intents/near-intents-logo.png`,
    dappId: NEAR_INTENTS_HOOK_DAPP_ID,
    website: 'https://www.near.org/intents',
  }

  constructor(options?: NearIntentsBridgeProviderOptions, _adapter?: AbstractProviderAdapter) {
    const adapter = _adapter || options?.cowShedOptions?.adapter
    if (adapter) {
      setGlobalAdapter(adapter)
    }
    this.api = new NearIntentsApi()
    this.cowShedSdk = new CowShedSdk(adapter, options?.cowShedOptions?.factoryOptions)
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return NEAR_INTENTS_SUPPORTED_NETWORKS
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    const tokens = adaptTokens(await this.api.getTokens())
    const filteredTokens = tokens.filter((token) => token.chainId === params.buyChainId)

    return {
      tokens: filteredTokens,
      isRouteAvailable: filteredTokens.length > 0,
    }
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    if (request.kind !== OrderKind.SELL) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED, { kind: request.kind })
    }

    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request

    const tokens = adaptTokens(await this.api.getTokens())
    const { sourceTokens, targetTokens } = tokens.reduce(
      (acc, token) => {
        if (token.chainId === sellTokenChainId) {
          acc.sourceTokens.set(token.address.toLowerCase() as Address, token)
        }
        if (token.chainId === buyTokenChainId) {
          acc.targetTokens.set(token.address.toLowerCase() as Address, token)
        }
        return acc
      },
      {
        sourceTokens: new Map<Address, TokenInfo>(),
        targetTokens: new Map<Address, TokenInfo>(),
      },
    )

    const targetToken = targetTokens.get(buyTokenAddress.toLowerCase() as Address)
    const targetSymbol = targetToken?.symbol?.toLowerCase()
    if (!targetSymbol) return []

    return Array.from(sourceTokens.values()).filter((token) => token.symbol?.toLowerCase() === targetSymbol)
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
      owner,
    } = request

    const tokens = await this.api.getTokens()
    const sellToken = getTokenByAddressAndChainId(tokens, sellTokenAddress, sellTokenChainId)
    const buyToken = getTokenByAddressAndChainId(tokens, buyTokenAddress, buyTokenChainId)
    if (!sellToken || !buyToken) throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES)

    const quoteResponse = await this.api.getQuote({
      dry: false,
      swapType: QuoteRequest.swapType.EXACT_INPUT,
      slippageTolerance: request.slippageBps ?? 100,
      originAsset: sellToken.assetId,
      depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
      destinationAsset: buyToken.assetId,
      amount: amount.toString(),
      refundTo: owner || account,
      refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
      recipient: receiver || account,
      recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
      deadline: calculateDeadline(validFor || 3600),
      referral: REFERRAL,
    })

    if (!(await this.verifyDepositAddress(quoteResponse)))
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.API_ERROR)

    const { quote, timestamp: isoDate } = quoteResponse

    const payoutRatio = Number(quote.amountOutUsd) / Number(quote.amountInUsd)
    const slippage = 1 - payoutRatio
    const slippageBps = Math.trunc(slippage * 10_000)
    const feeAmountInBuyCurrency = Math.trunc(Number(quote.amountIn) * slippage)
    const feeAmountInSellCurrency = Math.trunc(Number(quote.amountOut) * slippage)
    const bridgeFee = Math.trunc(Number(quote.amountIn) * slippage)

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
        bridgeFee: BigInt(bridgeFee), // The bridge fee is already included in `minAmountOut`. This means `bridgeFee` represents the maximum possible fee (worst case), but the actual fee may be lower.
        destinationGasFee: BigInt(0),
      },
      amountsAndCosts: {
        beforeFee: {
          sellAmount: BigInt(quote.amountIn),
          buyAmount: BigInt(quote.amountOut),
        },
        afterFee: {
          sellAmount: BigInt(quote.amountIn),
          buyAmount: BigInt(quote.minAmountOut),
        },
        afterSlippage: {
          sellAmount: BigInt(quote.amountIn),
          buyAmount: BigInt(quote.minAmountOut),
        },
        slippageBps,
        costs: {
          bridgingFee: {
            feeBps: slippageBps,
            amountInSellCurrency: BigInt(feeAmountInSellCurrency),
            amountInBuyCurrency: BigInt(feeAmountInBuyCurrency),
          },
        },
      },
    }
  }

  async getBridgeReceiverOverride(request: QuoteBridgeRequest, quote: NearIntentsQuoteResult): Promise<string> {
    return quote.depositAddress
  }

  async getBridgingParams(
    chainId: ChainId,
    order: EnrichedOrder,
    txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    const depositAddress = order.receiver
    if (!depositAddress) return null

    const [tokens, status] = await Promise.all([this.api.getTokens(), this.api.getStatus(depositAddress)])

    // Unpack quote data
    const qr = status.quoteResponse?.quoteRequest
    const quote = status.quoteResponse?.quote
    const timestampMs = Date.parse(status.quoteResponse?.timestamp ?? '')
    if (!qr || !quote || Number.isNaN(timestampMs)) {
      throw new Error('Malformed quote response from NEAR Intents')
    }

    const quoteTimestamp = Math.floor(timestampMs / 1000)

    // Locate origin/destination tokens
    const inputToken = tokens.find((t) => t.assetId === qr.originAsset)
    const outputToken = tokens.find((t) => t.assetId === qr.destinationAsset)
    if (!inputToken || !outputToken) throw new Error('Token not supported')

    // Normalize to local token shape
    const adaptedInput = adaptToken(inputToken)
    const adaptedOutput = adaptToken(outputToken)
    if (!adaptedInput?.chainId || !adaptedOutput?.chainId) {
      throw new Error('Token not supported')
    }

    // Build response
    return {
      status: {
        fillTimeInSeconds: quote.timeEstimate,
        status: NEAR_INTENTS_STATUS_TO_COW_STATUS[status.status] ?? BridgeStatus.UNKNOWN,
        fillTxHash: status.swapDetails?.destinationChainTxHashes?.[0]?.hash,
      },
      params: {
        inputTokenAddress: inputToken.contractAddress ?? ETH_ADDRESS,
        outputTokenAddress: outputToken.contractAddress ?? ETH_ADDRESS,
        inputAmount: BigInt(quote.amountIn),
        outputAmount: BigInt(quote.amountOut),
        owner: order.owner,
        quoteTimestamp,
        fillDeadline: quoteTimestamp + quote.timeEstimate,
        recipient: qr.recipient,
        sourceChainId: adaptedInput.chainId,
        destinationChainId: adaptedOutput.chainId,
        bridgingId: depositAddress, // NEAR Intents deposit address
      },
    }
  }

  getExplorerUrl(bridgingId: string): string {
    return `https://explorer.near-intents.org/transactions/${bridgingId}`
  }

  async getStatus(bridgingId: string, _originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    // bridingId must be the deposit address
    try {
      const statusResponse = await this.api.getStatus(bridgingId)
      return {
        status: NEAR_INTENTS_STATUS_TO_COW_STATUS[statusResponse.status] || BridgeStatus.UNKNOWN,
        depositTxHash: statusResponse.swapDetails?.originChainTxHashes[0]?.hash,
        fillTxHash: statusResponse.swapDetails?.destinationChainTxHashes[0]?.hash,
      }
    } catch {
      return {
        status: BridgeStatus.UNKNOWN,
      }
    }
  }

  getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  private async verifyDepositAddress({ quote, quoteRequest, timestamp }: QuoteResponse): Promise<boolean> {
    try {
      if (!quote?.depositAddress) return false

      const quoteHash = hashQuote({ quote, quoteRequest, timestamp })

      const depositAddr = getAddress(quote.depositAddress as Address)
      const { signature } = await this.api.getAttestation({
        quoteHash,
        depositAddress: depositAddr,
      })
      if (!signature || !isHex(signature)) return false

      // Build message bytes (prefix || version || depositAddress || quoteHash)
      const payload = concat([hexToBytes(depositAddr), hexToBytes(quoteHash)])
      const messageBytes = concat([hexToBytes(ATTESTATION_PREFIX_CONST), hexToBytes(ATTESTION_VERSION_BYTE), payload])

      const hash = keccak256(messageBytes)
      const recovered = await recoverAddress({ hash, signature })

      return getAddress(recovered) === getAddress(ATTESTATOR_ADDRESS)
    } catch {
      return false
    }
  }
}
