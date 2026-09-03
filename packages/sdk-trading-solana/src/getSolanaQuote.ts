import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { SOLANA_SETTLEMENT_PROGRAM_ID } from '@cowprotocol/sdk-config'
import { getQuoteAmountsAndCosts, OrderKind, OrderParameters, OrderQuoteResponse } from '@cowprotocol/sdk-order-book'

import { JupiterAPI } from './jupiterApi'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent } from './orderIntent'
import { findOrderPda } from './orderPda'
import { SolanaQuote, SolanaQuoteParameters } from './types'
import type { QuoteResults, TradeParameters } from '@cowprotocol/sdk-trading'

const DEFAULT_VALID_FOR_SECONDS = 30 * 60
/** No Solana app-data convention exists yet (confirmed absent from the settlement program's intent
 * struct beyond an opaque 32 bytes) — sent as zeroes until one is defined. */
const ZERO_APP_DATA = new Uint8Array(32)

const jupiterApi = new JupiterAPI()

export async function getSolanaQuote(
  params: SolanaQuoteParameters,
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
  const sellMint = new PublicKey(params.sellTokenAddress)
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
  const programId = new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID)
  const [orderPda] = findOrderPda(programId, uid)

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
    sellToken: sellTokenAddress,
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
