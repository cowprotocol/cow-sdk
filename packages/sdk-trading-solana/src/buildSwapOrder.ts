import type { QuoteResults, SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import { SigningScheme } from '@cowprotocol/sdk-order-book'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'
import { mergeAppData } from './appData'
import { buildCreateOrderInstruction } from './createOrderInstruction'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent, toOrderId } from './orderIntent'
import { findOrderPda } from './orderPda'
import { SolanaQuote } from './types'

export interface SolanaSwapOrderQuote {
  quoteResults: QuoteResults
  solanaQuote: SolanaQuote
}

export interface BuildSolanaSwapOrderOptions {
  /** Funds the order PDA's rent and pays the transaction fee instead of the owner — take it from
   * `getSolanaOrderSponsor`. It signs on the back end, never here, so a sponsored transaction leaves
   * its signature slot empty. */
  sponsor?: PublicKeyInitData
}

export interface SolanaSwapOrder {
  /** The `CreateOrder` instruction. Send it on its own, or bundle it with other instructions. */
  instruction: TransactionInstruction
  /** Who the transaction carrying `instruction` must name as fee payer: the sponsor, or the owner. */
  feePayer: PublicKey
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
 * signed order body to POST. Without `options.sponsor` a single connected wallet both authenticates the
 * order and funds its PDA's rent; with one, those two roles split and `createdBy` becomes the sponsor.
 */
export async function buildSolanaSwapOrder(
  { quoteResults, solanaQuote }: SolanaSwapOrderQuote,
  advancedSettings?: SwapAdvancedSettings,
  options: BuildSolanaSwapOrderOptions = {},
): Promise<SolanaSwapOrder> {
  const { validTo, receiver } = advancedSettings?.quoteRequest ?? {}

  const overrides: Partial<SolanaOrderIntent> = {
    ...(receiver && {
      buyTokenAccount: getAssociatedTokenAddressSync(
        solanaQuote.intent.buyMint,
        new PublicKey(receiver),
        false,
        solanaQuote.buyTokenProgramId,
      ),
    }),
    ...(validTo && { validTo }),
    ...(advancedSettings?.appData && {
      appData: await mergeAppData(quoteResults.appDataInfo.doc ?? {}, advancedSettings.appData),
    }),
  }

  const intent = { ...solanaQuote.intent, ...overrides }

  let uid = solanaQuote.uid
  let orderPda = solanaQuote.orderPda

  if (Object.keys(overrides).length > 0) {
    const intentBytes = encodeOrderIntent(intent)
    uid = await hashOrderIntent(intentBytes)
    ;[orderPda] = findOrderPda(solanaQuote.programId, uid)
  }

  const feePayer = options.sponsor ? new PublicKey(options.sponsor) : intent.owner

  const instruction = buildCreateOrderInstruction({
    programId: solanaQuote.programId,
    owner: intent.owner,
    createdBy: feePayer,
    orderPda,
    intent,
  })

  return {
    instruction,
    feePayer,
    orderId: toOrderId(uid),
    uid,
    orderPda,
    intent,
    signingScheme: SigningScheme.PRESIGN,
    orderToSign: quoteResults.orderToSign,
  }
}
