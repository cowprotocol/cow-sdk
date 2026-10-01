/**
 * A sponsored Solana order. The owner signs the creation transaction but does not pay for it: the
 * protocol's funder is its fee payer, countersigns it, and submits it.
 *
 * Hand-written because the order book's openapi declares this body as an anonymous inline object
 * rather than a named schema, so the generator produces no model for it.
 */
export interface SolanaOrderCreation {
  /** The owner-signed, funder-unsigned creation transaction, base64. */
  partiallySignedTx: string
  /** The id the quote endpoint answered for this order. Kept only when the quote matches the order. */
  quoteId?: number
}

/**
 * The parameters for the Solana `getOrders` request.
 */
export interface SolanaGetOrdersRequest {
  /** The order owner, base58. */
  owner: string
  offset?: number
  limit?: number
}

/**
 * The parameters for the Solana `getTrades` request. Exactly one of `owner` and `orderUid`.
 */
export interface SolanaGetTradesRequest {
  /** The order owner, base58. */
  owner?: string
  /** The order's 32-byte intent hash, `0x`-hex. */
  orderUid?: string
  offset?: number
  limit?: number
}
