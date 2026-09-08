import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import {
  CowEnv,
  SOL_NATIVE_CURRENCY_ADDRESS,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/sdk-config'
import { getQuoteAmountsAndCosts, OrderKind, OrderParameters, OrderQuoteResponse } from '@cowprotocol/sdk-order-book'

import { JupiterAPI } from './jupiterApi'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent } from './orderIntent'
import { findOrderPda } from './orderPda'
import { getSolanaSettlementProgramId } from './statePda'
import { SolanaQuote, SolanaQuoteParameters } from './types'
import type { QuoteResults, TradeParameters } from '@cowprotocol/sdk-trading'

const DEFAULT_VALID_FOR_SECONDS = 30 * 60
/** No Solana app-data convention exists yet (confirmed absent from the settlement program's intent
 * struct beyond an opaque 32 bytes) — sent as zeroes until one is defined. */
const ZERO_APP_DATA = new Uint8Array(32)

const jupiterApi = new JupiterAPI()

/** The chain's native-currency sentinel — the System Program address, which is not a token mint. */
const NATIVE_SOL_MINT = new PublicKey(SOL_NATIVE_CURRENCY_ADDRESS)
const WSOL_MINT = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)

/**
 * Jupiter routes and the settlement intent both address tokens by SPL mint, and native SOL has none.
 * Callers pass the native sentinel, so substitute WSOL — the same adjustment `getQuote` makes for EVM
 * eth-flow orders via `adjustEthFlowOrderParams`. Both have 9 decimals, so amounts carry over unchanged.
 *
 * This has to happen before the intent is built, not just before the Jupiter call: the intent's
 * `sellTokenAccount` is the associated token account of this mint, and only the WSOL one can ever hold
 * the wrapped lamports the caller's wrap step produces.
 */
function toSplMint(mint: PublicKey): PublicKey {
  return mint.equals(NATIVE_SOL_MINT) ? WSOL_MINT : mint
}

export async function getSolanaQuote(
  params: SolanaQuoteParameters,
  options: { env?: CowEnv } = {},
): Promise<{ quoteResults: QuoteResults; solanaQuote: SolanaQuote }> {
  const {
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

  const owner = new PublicKey(ownerAddress)
  const receiver = new PublicKey(receiverAddress)
  const requestedSellMint = new PublicKey(params.sellTokenAddress)
  const sellMint = toSplMint(requestedSellMint)
  const buyMint = new PublicKey(params.buyTokenAddress)
  const sellTokenProgram = sellTokenProgramId ? new PublicKey(sellTokenProgramId) : undefined
  const buyTokenProgram = buyTokenProgramId ? new PublicKey(buyTokenProgramId) : undefined

  const sellTokenAddress = sellMint.toBase58()
  const buyTokenAddress = buyMint.toBase58()

  const jupiterOrder = await jupiterApi.getOrder({
    inputMint: sellTokenAddress,
    outputMint: buyTokenAddress,
    amount: amount.toString(),
    swapMode: kind === OrderKind.SELL ? 'ExactIn' : 'ExactOut',
  })

  const validTo = Math.floor(Date.now() / 1000) + validForSeconds

  const orderParams: OrderParameters = {
    sellToken: sellTokenAddress,
    buyToken: buyTokenAddress,
    receiver: receiver.toBase58(),
    sellAmount: jupiterOrder.inAmount,
    buyAmount: jupiterOrder.outAmount,
    validTo,
    // TODO: fill appData when we know the format
    appData: '{}',
    // TODO: implement fees
    feeAmount: '0',
    gasAmount: '0',
    gasPrice: '0',
    sellTokenPrice: '0',
    kind,
    partiallyFillable,
  }

  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams,
    slippagePercentBps: jupiterOrder.slippageBps,
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
    jupiterOrder,
    buyTokenProgramId: buyTokenProgram,
  }

  const quoteResponse: OrderQuoteResponse = {
    quote: orderParams,
    from: owner.toBase58(),
    expiration: new Date(intent.validTo * 1000).toISOString(),
    verified: false,
  }

  // Auto-slippage only: `slippageBps` is intentionally left unset (Jupiter's suggestion lives in
  // `suggestedSlippageBps` above) so `quoteUsingSameParameters`'s `compareSlippage` treats it as "no
  // user override" and doesn't force a requote whenever Jupiter's suggestion drifts between polls.
  const tradeParameters: TradeParameters = {
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
    partiallyFillable: orderParams.partiallyFillable,
  }

  const quoteResults: QuoteResults = {
    quoteResponse,
    amountsAndCosts,
    suggestedSlippageBps: jupiterOrder.slippageBps,
    tradeParameters,
    orderToSign: {} as QuoteResults['orderToSign'],
    appDataInfo: {} as QuoteResults['appDataInfo'],
    orderTypedData: {} as QuoteResults['orderTypedData'],
  }

  return { quoteResults, solanaQuote }
}
