import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { CowEnv, SupportedChainId } from '@cowprotocol/sdk-config'
import {
  getQuoteAmountsAndCosts,
  OrderBookApi,
  OrderKind,
  OrderQuoteRequest,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  SigningScheme,
} from '@cowprotocol/sdk-order-book'

import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent } from './orderIntent'
import { findOrderPda } from './orderPda'
import { toSplMint } from './splMint'
import { getSolanaSettlementProgramId } from './statePda'
import { SolanaQuote, SolanaQuoteParameters } from './types'
import type { QuoteResults, TradeParameters } from '@cowprotocol/sdk-trading'

const DEFAULT_VALID_FOR_SECONDS = 30 * 60
/** CoW Protocol's `/quote` doesn't suggest a slippage for Solana the way Jupiter used to — falls back to
 * the same default the EVM SDK uses when the caller doesn't override it. */
const DEFAULT_SLIPPAGE_BPS = 50
/** No Solana app-data convention exists yet (confirmed absent from the settlement program's intent
 * struct beyond an opaque 32 bytes) — sent as zeroes until one is defined. */
const ZERO_APP_DATA = new Uint8Array(32)

export async function getSolanaQuote(
  params: SolanaQuoteParameters,
  options: { env?: CowEnv; orderBookApi?: OrderBookApi } = {},
): Promise<{ quoteResults: QuoteResults; solanaQuote: SolanaQuote }> {
  const {
    slippageBps: slippageBpsOverride,
    ownerAddress,
    receiverAddress,
    sellTokenDecimals,
    buyTokenDecimals,
    amount,
    kind,
    partiallyFillable = false,
    validForSeconds = DEFAULT_VALID_FOR_SECONDS,
    sellTokenProgramId,
    buyTokenProgramId,
  } = params

  if (!Number.isFinite(validForSeconds) || validForSeconds <= 0) {
    throw new Error('validForSeconds must be a finite number greater than zero')
  }

  if (slippageBpsOverride !== undefined && (!Number.isFinite(slippageBpsOverride) || slippageBpsOverride < 0)) {
    throw new Error('slippageBps must be a finite number greater than or equal to zero')
  }

  const owner = new PublicKey(ownerAddress)
  const receiver = new PublicKey(receiverAddress)
  const requestedSellMint = new PublicKey(params.sellTokenAddress)
  const sellMint = toSplMint(requestedSellMint)
  const buyMint = new PublicKey(params.buyTokenAddress)
  const sellTokenProgram = sellTokenProgramId ? new PublicKey(sellTokenProgramId) : undefined
  const buyTokenProgram = buyTokenProgramId ? new PublicKey(buyTokenProgramId) : undefined

  const sellTokenAddress = sellMint.toBase58()
  const buyTokenAddress = buyMint.toBase58()

  const orderBookApi = options.orderBookApi ?? new OrderBookApi({ chainId: SupportedChainId.SOLANA, env: options.env })

  const quoteRequest: OrderQuoteRequest = {
    from: owner.toBase58(),
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    receiver: receiver.toBase58(),
    validFor: validForSeconds,
    // TODO: fill appData when we know the format
    appData: '{}',
    priceQuality: PriceQuality.VERIFIED,
    signingScheme: SigningScheme.EIP712,
    ...(kind === OrderKind.SELL
      ? { kind: OrderQuoteSideKindSell.SELL, sellAmountBeforeFee: amount.toString() }
      : { kind: OrderQuoteSideKindBuy.BUY, buyAmountAfterFee: amount.toString() }),
  }

  const quoteResponse = await orderBookApi.getQuote(quoteRequest)
  const orderParams = quoteResponse.quote
  const validTo = orderParams.validTo

  const suggestedSlippageBps = slippageBpsOverride ?? DEFAULT_SLIPPAGE_BPS

  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams,
    slippagePercentBps: suggestedSlippageBps,
    // TODO: implement fees
    partnerFeeBps: 0,
    protocolFeeBps: 0,
  })

  const intent: SolanaOrderIntent = {
    owner,
    buyTokenAccount: getAssociatedTokenAddressSync(buyMint, receiver, false, buyTokenProgram),
    buyMint,
    sellTokenAccount: getAssociatedTokenAddressSync(sellMint, owner, false, sellTokenProgram),
    sellMint,
    sellAmount: amountsAndCosts.amountsToSign.sellAmount,
    buyAmount: amountsAndCosts.amountsToSign.buyAmount,
    validTo,
    kind,
    partiallyFillable,
    createdOnChain: true,
    appData: ZERO_APP_DATA,
  }

  const intentBytes = encodeOrderIntent(intent)
  const uid = await hashOrderIntent(intentBytes)
  const programId = getSolanaSettlementProgramId(options.env)
  const [orderPda] = findOrderPda(programId, uid, options.env)

  const solanaQuote: SolanaQuote = {
    intent,
    intentBytes,
    uid,
    orderPda,
    programId,
    buyTokenProgramId: buyTokenProgram,
  }

  // Reported only when the caller set the tolerance, so `quoteUsingSameParameters`'s `compareSlippage`
  // requotes when they change it. Left unset otherwise: the quote's own suggestion is not a user override,
  // and echoing it would force a requote every time it drifts between polls.
  const tradeParameters: TradeParameters = {
    ...(slippageBpsOverride !== undefined ? { slippageBps: slippageBpsOverride } : undefined),
    kind,
    owner: owner.toBase58(),
    // The mint the caller asked for, not the substituted one: callers compare the returned parameters
    // against the ones they passed to decide whether a quote is still current, and reporting WSOL for a
    // native-SOL request would read as a changed sell token and requote forever.
    sellToken: requestedSellMint.toBase58(),
    sellTokenDecimals,
    buyToken: buyTokenAddress,
    buyTokenDecimals,
    amount: amount.toString(),
    receiver: receiver.toBase58(),
    validFor: validForSeconds,
    // The caller's own request, not the API's echoed value: `partiallyFillable` isn't part of the quote
    // request, so the response says nothing about what the caller actually intends to sign.
    partiallyFillable,
  }

  const quoteResults: QuoteResults = {
    quoteResponse,
    amountsAndCosts,
    suggestedSlippageBps,
    tradeParameters,
    orderToSign: {} as QuoteResults['orderToSign'],
    appDataInfo: {} as QuoteResults['appDataInfo'],
    orderTypedData: {} as QuoteResults['orderTypedData'],
  }

  return { quoteResults, solanaQuote }
}
