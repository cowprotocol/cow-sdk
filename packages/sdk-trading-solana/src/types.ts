import { PublicKey, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'
import type { OrderKind, PriceQuality } from '@cowprotocol/sdk-order-book'

import { SolanaOrderIntent } from './orderIntent'

export interface SolanaQuoteParameters {
  ownerAddress: PublicKeyInitData
  sellTokenAddress: PublicKeyInitData
  sellTokenDecimals: number
  buyTokenAddress: PublicKeyInitData
  buyTokenDecimals: number
  /** Sell-side amount for a SELL order, buy-side amount for a BUY order. */
  amount: bigint
  kind: OrderKind
  priceQuality?: PriceQuality
  receiverAddress?: PublicKeyInitData
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
  /** Pays for a sponsored order on this deployment — pass it as `sponsor` to `buildSolanaSwapOrder`
   * and name it as the transaction's fee payer. Absent when the deployment has no sponsoring. */
  funder?: PublicKey
}

/** Signs and submits a `CreateOrder` instruction; supplied by the caller since this SDK has no bound
 * Solana wallet/signer (unlike the EVM adapter). */
export type SolanaSignAndSend = (instruction: TransactionInstruction) => Promise<{ signature: string }>
