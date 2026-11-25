import type { QuoteResults, SwapAdvancedSettings, TradingAppDataInfo } from '@cowprotocol/sdk-trading'
import { SigningScheme } from '@cowprotocol/sdk-order-book'
import { PublicKey, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'
import { mergeAppData, SolanaAppDataInfo } from './appData'
import { deriveAta } from './associatedTokenAccount'
import { buildCreateOrderInstruction } from './createOrderInstruction'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent, toOrderId } from './orderIntent'
import { findOrderPda } from './orderPda'
import { buildSolanaQuoteMemoInstruction } from './quoteMemo'
import { isNativeSolMint } from './splMint'
import { SolanaQuote } from './types'

export interface SolanaSwapOrderQuote {
  quoteResults: QuoteResults
  solanaQuote: SolanaQuote
}

export interface BuildSolanaSwapOrderOptions {
  /** Funds the order PDA's rent and pays the transaction fee instead of the owner — take it from the
   * quote's `funder`. It signs on the back end, never here, so a sponsored transaction leaves its
   * signature slot empty. */
  sponsor?: PublicKeyInitData
  /**
   * Whether to emit the memo linking the created order to the quote it came from — see
   * {@link buildSolanaQuoteMemoInstruction}. Defaults to on for an owner-paid order whose quote
   * reported an id, and off for a sponsored one: there the id travels in the placement request
   * instead, and the order book refuses a bundle carrying any instruction its template does not name.
   *
   * Pass `{ quoteId }` when the quote was fetched elsewhere, and `false` when the transaction already
   * holds a memo or creates more than one order — either of those voids the link.
   */
  quoteMemo?: boolean | { quoteId: number }
}

export interface SolanaSwapOrder {
  /** The `CreateOrder` instruction. Send it on its own, or bundle it with other instructions. */
  instruction: TransactionInstruction
  /** The quote-linking memo, when one was emitted — see `BuildSolanaSwapOrderOptions.quoteMemo`. */
  quoteMemoInstruction?: TransactionInstruction
  /** Everything the creation needs, in the order a transaction must carry it: the memo, when there is
   * one, then `instruction`. `CreateOrder` stays last, which is what a sponsored bundle requires. */
  instructions: TransactionInstruction[]
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
  /** The app-data doc `intent.appData` is the digest of. The order book must be given it — uploaded, or
   * sent with a sponsored order — for the digest to resolve. Absent when the caller supplied raw bytes. */
  appDataInfo?: TradingAppDataInfo
}

/**
 * Builds everything needed to create `quote`'s order on-chain, without signing or sending it. Callers that
 * want the SDK to submit it should use `postSolanaSwapOrderFromQuote`; callers bundling the order with
 * other instructions (a wrap, a token delegation) take `instructions` from here and send them themselves.
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
  const appDataInfo = advancedSettings?.appData
    ? await mergeAppData(quoteResults.appDataInfo.doc ?? {}, advancedSettings.appData)
    : undefined

  const overrides: Partial<SolanaOrderIntent> = {
    ...(receiver && {
      buyTokenAccount: resolveBuyTokenAccount(solanaQuote, new PublicKey(receiver)),
    }),
    ...(validTo && { validTo }),
    ...(appDataInfo && { appData: appDataInfo.appDataBytes }),
  }

  const intent = { ...solanaQuote.intent, ...overrides }

  let uid = solanaQuote.uid
  let orderPda = solanaQuote.orderPda

  if (Object.keys(overrides).length > 0) {
    const intentBytes = encodeOrderIntent(intent)
    uid = await hashOrderIntent(intentBytes)
    ;[orderPda] = findOrderPda(solanaQuote.programId, uid, solanaQuote.env)
  }

  const feePayer = options.sponsor ? new PublicKey(options.sponsor) : intent.owner

  const instruction = buildCreateOrderInstruction({
    programId: solanaQuote.programId,
    owner: intent.owner,
    createdBy: feePayer,
    orderPda,
    intent,
  })

  const quoteMemoInstruction = resolveQuoteMemoInstruction(quoteResults, options)

  return {
    instruction,
    ...(quoteMemoInstruction && { quoteMemoInstruction }),
    instructions: quoteMemoInstruction ? [quoteMemoInstruction, instruction] : [instruction],
    feePayer,
    orderId: toOrderId(uid),
    uid,
    orderPda,
    intent,
    signingScheme: SigningScheme.PRESIGN,
    orderToSign: quoteResults.orderToSign,
    appDataInfo: toTradingAppDataInfo(appDataInfo) ?? quoteResults.appDataInfo,
  }
}

function resolveQuoteMemoInstruction(
  quoteResults: QuoteResults,
  { sponsor, quoteMemo }: BuildSolanaSwapOrderOptions,
): TransactionInstruction | undefined {
  if (quoteMemo === false) return undefined

  // The endpoint answers `id: null` when it could not store the quote — which the generated type does
  // not admit — so normalize that away; the optional access covers hand-built quote results, which
  // `getSolanaQuote`'s own always fill.
  const quoteId = typeof quoteMemo === 'object' ? quoteMemo.quoteId : (quoteResults.quoteResponse?.id ?? undefined)

  // No id means the order book has nothing to link this creation to.
  if (quoteId === undefined) return undefined

  const isSponsoredDefault = quoteMemo === undefined && sponsor !== undefined

  return isSponsoredDefault ? undefined : buildSolanaQuoteMemoInstruction(quoteId)
}

function toTradingAppDataInfo(info: SolanaAppDataInfo | undefined): TradingAppDataInfo | undefined {
  if (!info) return undefined

  const { doc, fullAppData, appDataKeccak256 } = info

  return { doc, fullAppData, appDataKeccak256 }
}

/**
 * Where a new `receiver` gets paid. A native-SOL buy is credited as lamports on the receiver's own
 * account, so there is no associated token account to derive — the quoted `buyMint` being the sentinel
 * is what says so.
 */
function resolveBuyTokenAccount(solanaQuote: SolanaQuote, receiver: PublicKey): PublicKey {
  const { buyMint } = solanaQuote.intent

  return isNativeSolMint(buyMint) ? receiver : deriveAta(buyMint, receiver, solanaQuote.buyTokenProgramId)
}
