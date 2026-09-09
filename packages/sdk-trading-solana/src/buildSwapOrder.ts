import type { QuoteResults, SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import { SigningScheme } from '@cowprotocol/sdk-order-book'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { buildCreateOrderInstruction } from './createOrderInstruction'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent, toOrderId } from './orderIntent'
import { findOrderPda } from './orderPda'
import { SolanaQuote } from './types'

export interface SolanaSwapOrderQuote {
  quoteResults: QuoteResults
  solanaQuote: SolanaQuote
}

export interface SolanaSwapOrder {
  /** The `CreateOrder` instruction. Send it on its own, or bundle it with other instructions. */
  instruction: TransactionInstruction
  /** `uid` as the order-book's `0x`-prefixed uid — see `toOrderId`. */
  orderId: string
  uid: Uint8Array
  orderPda: PublicKey
  /** The intent actually encoded into `instruction` — `advancedSettings` may have overridden the quoted one. */
  intent: SolanaOrderIntent
  signingScheme: SigningScheme
  orderToSign: QuoteResults['orderToSign']
}

/**
 * Builds everything needed to create `quote`'s order on-chain, without signing or sending it. Callers that
 * want the SDK to submit it should use `postSolanaSwapOrderFromQuote`; callers bundling the order with
 * other instructions (a wrap, a token delegation) take `instruction` from here and send it themselves.
 *
 * Solana orders are created entirely on-chain, so — unlike the EVM `postSwapOrderFromQuote` — there is no
 * signed order body to POST, and `createdBy` is always `intent.owner`: a single connected wallet both
 * authenticates the order and funds its PDA's rent.
 */
export async function buildSolanaSwapOrder(
  { quoteResults, solanaQuote }: SolanaSwapOrderQuote,
  advancedSettings?: SwapAdvancedSettings,
): Promise<SolanaSwapOrder> {
  const intent = { ...solanaQuote.intent }
  let uid = solanaQuote.uid
  let orderPda = solanaQuote.orderPda

  if (advancedSettings?.quoteRequest) {
    const { validTo, receiver } = advancedSettings.quoteRequest

    if (receiver) {
      intent.buyTokenAccount = getAssociatedTokenAddressSync(
        intent.buyMint,
        new PublicKey(receiver),
        false,
        solanaQuote.buyTokenProgramId,
      )
    }
    if (validTo) intent.validTo = validTo

    // `uid`/`orderPda` are the hash/PDA of the *quoted* intent bytes — re-derive them whenever the
    // intent is overridden so the posted order PDA still matches the intent actually being created.
    if (receiver || validTo) {
      const intentBytes = encodeOrderIntent(intent)
      uid = await hashOrderIntent(intentBytes)
      ;[orderPda] = findOrderPda(solanaQuote.programId, uid)
    }
  }

  const instruction = buildCreateOrderInstruction({
    programId: solanaQuote.programId,
    owner: intent.owner,
    createdBy: intent.owner,
    orderPda,
    intent,
  })

  return {
    instruction,
    orderId: toOrderId(uid),
    uid,
    orderPda,
    intent,
    signingScheme: SigningScheme.PRESIGN,
    orderToSign: quoteResults.orderToSign,
  }
}
