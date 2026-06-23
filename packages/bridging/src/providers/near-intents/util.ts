import stringify from 'json-stable-stringify'
import type { Quote, QuoteRequest, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'
import { areAddressesEqual, getGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  BTC_CURRENCY_ADDRESS,
  ETH_ADDRESS,
  SOL_NATIVE_CURRENCY_ADDRESS,
  TokenInfo,
  ChainId,
  isEvmChain,
} from '@cowprotocol/sdk-config'
import type { Hex } from 'viem'

import { NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS } from './const'

import type { NearBlockchainKey } from './const'

export const calculateDeadline = (seconds: number) => {
  const secs = Number(seconds)
  if (!Number.isFinite(secs)) {
    throw new Error(`Invalid seconds value: ${seconds}`)
  }
  const d = new Date(Date.now() + secs * 1000)
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/**
 * One-Click returns natives as either `contractAddress = undefined` (EVM, SOL)
 * or the literal string `'coin'` (BTC's `1cs_v1:btc:native:coin` shape).
 * Normalize both forms to the cow-sdk native sentinel for the given chain.
 */
const resolveTokenAddress = (chainId: ChainId, contractAddress: string | undefined): string | null => {
  const isBtcNative =
    chainId === NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS.btc && (!contractAddress || contractAddress === 'coin')
  if (isBtcNative) return BTC_CURRENCY_ADDRESS
  if (contractAddress) return contractAddress
  if (chainId === NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS.sol) return SOL_NATIVE_CURRENCY_ADDRESS
  if (isEvmChain(chainId)) return ETH_ADDRESS
  return null
}

export const adaptToken = (token: TokenResponse): TokenInfo | null => {
  const chainId = NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS[token.blockchain as NearBlockchainKey]
  if (!chainId) return null
  const tokenAddress = resolveTokenAddress(chainId, token.contractAddress)
  if (!tokenAddress) return null

  return {
    chainId,
    decimals: token.decimals,
    address: tokenAddress,
    name: token.symbol, // TODO: how to handle? v0/tokens doesn't return the token name
    symbol: token.symbol,
  }
}

export const adaptTokens = (tokens: TokenResponse[]): TokenInfo[] =>
  tokens.reduce<TokenInfo[]>((acc, token) => {
    const adaptedToken = adaptToken(token)
    if (!adaptedToken) return acc
    acc.push(adaptedToken)
    return acc
  }, [])

export const getTokenByAddressAndChainId = (
  tokens: TokenResponse[],
  targetTokenAddress: string,
  targetTokenChainId: ChainId,
): TokenResponse | undefined => {
  return tokens.find((token) => {
    const chainId = NEAR_INTENTS_BLOCKCHAIN_CHAIN_IDS[token.blockchain as NearBlockchainKey]
    if (!chainId || chainId !== targetTokenChainId) return false
    const tokenAddress = resolveTokenAddress(chainId, token.contractAddress)
    return tokenAddress ? areAddressesEqual(tokenAddress, targetTokenAddress) : false
  })
}

export const hashQuote = ({
  quote,
  quoteRequest,
  timestamp,
}: {
  quote: Quote
  quoteRequest: QuoteRequest
  timestamp: any
}): { hash: Hex; stringifiedQuote: string } => {
  const adapter = getGlobalAdapter()
  const stringifiedQuote = stringify({
    dry: false,
    swapType: quoteRequest.swapType,
    slippageTolerance: quoteRequest.slippageTolerance,
    originAsset: quoteRequest.originAsset,
    destinationAsset: quoteRequest.destinationAsset,
    amount: quoteRequest.amount,
    refundTo: quoteRequest.refundTo,
    refundType: quoteRequest.refundType,
    recipient: quoteRequest.recipient,
    recipientType: quoteRequest.recipientType,
    deadline: quoteRequest.deadline,
    quoteWaitingTimeMs: quoteRequest.quoteWaitingTimeMs ? quoteRequest.quoteWaitingTimeMs : undefined,
    referral: quoteRequest.referral ? quoteRequest.referral : undefined,
    virtualChainRecipient: quoteRequest.virtualChainRecipient ? quoteRequest.virtualChainRecipient : undefined,
    virtualChainRefundRecipient: quoteRequest.virtualChainRefundRecipient
      ? quoteRequest.virtualChainRefundRecipient
      : undefined,
    customRecipientMsg: undefined,
    sessionId: undefined,
    connectedWallets: undefined,
    depositMode: quoteRequest.depositMode,
    amountIn: quote.amountIn,
    amountInFormatted: quote.amountInFormatted,
    amountInUsd: quote.amountInUsd,
    minAmountIn: quote.minAmountIn,
    amountOut: quote.amountOut,
    amountOutFormatted: quote.amountOutFormatted,
    amountOutUsd: quote.amountOutUsd,
    minAmountOut: quote.minAmountOut,
    timestamp,
  })
  if (!stringifiedQuote) {
    throw new Error('Failed to serialize quote data: quote or quoteRequest may be undefined or invalid')
  }
  const hash = adapter.utils.sha256(adapter.utils.toUtf8Bytes(stringifiedQuote))
  return { hash, stringifiedQuote }
}
