import { PublicKey, TransactionInstruction } from '@solana/web3.js'

/** SPL Memo, deployed at this address on every cluster. */
export const SPL_MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

/** What the order book matches a creation memo on; the quote id follows it, in decimal. */
export const SOLANA_QUOTE_MEMO_PREFIX = 'cow:quote:'

/**
 * Builds the memo naming the quote an order was created from, as `cow:quote:<id>`. Bundle it in the
 * same transaction as the order's `CreateOrder` and the order book links the two, the way `quoteId`
 * names a quote when an order is placed through the API — which an on-chain creation never calls. The
 * link is what lets a filled order be compared against what was quoted.
 *
 * Text rather than packed bytes, and no accounts: the memo program rejects data that is not valid
 * UTF-8, and requires every account it is handed to have signed the transaction.
 *
 * The transaction must carry exactly one memo with this prefix and create exactly one order. A second
 * of either, or an id the order book cannot parse, leaves the order unlinked — it then falls back to
 * the best quote it stored for the order's pair, side and amount, which may not be the quote the user
 * actually saw.
 */
export function buildSolanaQuoteMemoInstruction(quoteId: number): TransactionInstruction {
  if (!Number.isSafeInteger(quoteId) || quoteId < 0) {
    throw new Error(`quoteId must be a non-negative integer, got ${quoteId}`)
  }

  return new TransactionInstruction({
    programId: SPL_MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(`${SOLANA_QUOTE_MEMO_PREFIX}${quoteId}`, 'utf8'),
  })
}
