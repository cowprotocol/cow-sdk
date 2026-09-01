import { PublicKey, TransactionInstruction } from '@solana/web3.js'

import { JupiterOrderResponse } from './jupiterApi'
import { SolanaOrderIntent } from './orderIntent'
import { OrderKind } from '@cowprotocol/sdk-order-book'

export interface SolanaQuoteParameters {
  owner: PublicKey
  sellMint: PublicKey
  buyMint: PublicKey
  /** Sell-side amount for a SELL order, buy-side amount for a BUY order — same convention as Jupiter's `amount`. */
  amount: bigint
  kind: OrderKind
  partiallyFillable?: boolean
  /** Order lifetime from now, in seconds. Defaults to 30 minutes. */
  validForSeconds?: number
  /** Token program owning `sellMint`'s accounts (classic SPL Token vs Token-2022). Defaults to the
   * classic SPL Token program — pass `TOKEN_2022_PROGRAM_ID` explicitly for Token-2022 mints, since the
   * associated token account address differs by program. */
  sellTokenProgramId?: PublicKey
  /** Same as `sellTokenProgramId`, for `buyMint`. */
  buyTokenProgramId?: PublicKey
}

export interface SolanaQuote {
  intent: SolanaOrderIntent
  intentBytes: Uint8Array
  /** SHA-256 of `intentBytes`; also the order's uid and the order PDA's seed. */
  uid: Uint8Array
  orderPda: PublicKey
  programId: PublicKey
  /** The raw Jupiter response the quote was built from — real amounts/slippage for the caller to read. */
  jupiterOrder: JupiterOrderResponse
}

/** Signs and submits a `CreateOrder` instruction; supplied by the caller since this SDK has no bound
 * Solana wallet/signer (unlike the EVM adapter). */
export type SolanaSignAndSend = (instruction: TransactionInstruction) => Promise<{ signature: string }>

export interface SolanaOrderPostingResult {
  /** Hex-encoded order uid. */
  orderId: string
  /** Hex-encoded order uid — no distinct field for it exists yet, so it's used as-is instead of being invented.  */
  txHash: string
}
