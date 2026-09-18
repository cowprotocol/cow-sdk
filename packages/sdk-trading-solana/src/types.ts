import { PublicKey, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'

import { SolanaOrderIntent } from './orderIntent'
import { OrderKind } from '@cowprotocol/sdk-order-book'

export interface SolanaQuoteParameters {
  ownerAddress: PublicKeyInitData
  receiverAddress: PublicKeyInitData
  sellTokenAddress: PublicKeyInitData
  sellTokenDecimals: number
  buyTokenAddress: PublicKeyInitData
  buyTokenDecimals: number
  /** Sell-side amount for a SELL order, buy-side amount for a BUY order. */
  amount: bigint
  kind: OrderKind
  partiallyFillable?: boolean
  /** Order lifetime from now, in seconds. Defaults to 30 minutes. */
  validForSeconds?: number
  /** Slippage tolerance to sign, in basis points. Defaults to the one the quote reports. */
  slippageBps?: number
  /** Token program owning `sellMint`'s accounts (classic SPL Token vs Token-2022). Defaults to the
   * classic SPL Token program — pass `TOKEN_2022_PROGRAM_ID` explicitly for Token-2022 mints, since the
   * associated token account address differs by program. */
  sellTokenProgramId?: PublicKeyInitData
  /** Same as `sellTokenProgramId`, for `buyMint`. */
  buyTokenProgramId?: PublicKeyInitData
}

export interface SolanaQuote {
  intent: SolanaOrderIntent
  intentBytes: Uint8Array
  /** SHA-256 of `intentBytes`; also the order's uid and the order PDA's seed. */
  uid: Uint8Array
  orderPda: PublicKey
  programId: PublicKey
  /** Token program owning `intent.buyMint`'s accounts, as resolved at quote time — needed to re-derive
   * `buyTokenAccount`'s associated token address if `receiver` is overridden when posting. */
  buyTokenProgramId?: PublicKey
}

/** Signs and submits a `CreateOrder` instruction; supplied by the caller since this SDK has no bound
 * Solana wallet/signer (unlike the EVM adapter). */
export type SolanaSignAndSend = (instruction: TransactionInstruction) => Promise<{ signature: string }>
