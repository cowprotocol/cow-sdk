import type { OrderPostingResult, QuoteResults, SigningStepManager, SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import { CowEnv } from '@cowprotocol/sdk-config'
import { OrderBookApi, UID } from '@cowprotocol/sdk-order-book'
import { createApproveInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'
import { buildSolanaLimitOrderOrder, SolanaLimitOrderParams } from './buildLimitOrder'
import { BuildSolanaSwapOrderOptions, buildSolanaSwapOrder, SolanaSwapOrder } from './buildSwapOrder'
import { buildCancelOrderInstruction } from './cancelOrderInstruction'
import { getSolanaQuote } from './getSolanaQuote'
import { SolanaOrderIntent } from './orderIntent'
import { postSolanaSponsoredOrder } from './postSponsoredOrder'
import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { getSolanaDelegateAuthority, getSolanaSettlementProgramId } from './statePda'
import { SolanaQuote, SolanaQuoteParameters, SolanaSignAndSend } from './types'

export interface SolanaTradingSdkOptions {
  env?: CowEnv
  /** Overrides the default `OrderBookApi` instance used to fetch quotes — e.g. to supply a `bearerToken`
   * while the Solana `/quote` endpoint is gated, or a custom `baseUrls`/`apiKey`. */
  orderBookApi?: OrderBookApi
}

export interface ApproveCowProtocolParams {
  ownerAddress: PublicKeyInitData
  sellTokenAddress: PublicKeyInitData
  /** Amount to approve, at least the order's `sellAmount`. */
  approveAmount: bigint
  /** Token program owning the sell mint's accounts (classic SPL Token vs Token-2022). Defaults to the
   * classic SPL Token program — pass `TOKEN_2022_PROGRAM_ID` explicitly for Token-2022 mints. */
  sellTokenProgramId?: PublicKeyInitData
}

export interface CancelOrderParams {
  /** Must match the order's intent owner; signs the cancellation transaction. */
  ownerAddress: PublicKeyInitData
  /** The order's PDA — see `findOrderPda`, or `orderPda` from `buildOrder`/`buildLimitOrder`. */
  orderPda: PublicKeyInitData
  /**
   * Present only to create the order already cancelled if it doesn't exist on-chain yet. Omit for the
   * cheaper, more common case of cancelling an order that's already on-chain: its data is recovered from
   * `orderPda` and only its `cancelled` flag is set.
   */
  intent?: SolanaOrderIntent
  /** Funds the order PDA's rent and must sign when `intent` is given; unused otherwise. Defaults to
   * `ownerAddress`. */
  createdByAddress?: PublicKeyInitData
}

/**
 * Solana counterpart to `QuoteAndPost`. It additionally exposes `solanaQuote` and `buildOrder`, because a
 * Solana order is a plain instruction: callers may want to bundle it with a wrap or a token delegation and
 * submit one transaction, rather than have the SDK send it alone.
 */
export interface SolanaQuoteAndPost {
  quoteResults: QuoteResults
  solanaQuote: SolanaQuote
  /** Build the `CreateOrder` instruction without sending it, to bundle with other instructions. */
  buildOrder(advancedSettings?: SwapAdvancedSettings, options?: BuildSolanaSwapOrderOptions): Promise<SolanaSwapOrder>
  /** Build, sign and submit the order as its own transaction. The owner pays; for a sponsored order
   * build the bundle with a `sponsor`, sign it without sending, and use `postSponsoredOrder`. */
  postSwapOrderFromQuote(
    signAndSend: SolanaSignAndSend,
    advancedSettings?: SwapAdvancedSettings,
    signingStepManager?: SigningStepManager,
  ): Promise<OrderPostingResult>
  /** Hand the signed sponsored bundle to the order book, which pays for it and submits it. `quoteId`
   * comes from this quote, so the order book can tie the order back to what was quoted. */
  postSponsoredOrder(transaction: string): Promise<UID>
}

/**
 * Solana counterpart to `TradingSdk`. Unlike the EVM SDK, which gets its signer implicitly from a global
 * adapter set once at app startup, Solana has no such adapter — so the signer is passed to
 * `postSwapOrderFromQuote` at the point of signing. Quoting therefore needs no signer at all, which also
 * lets a caller quote and then bundle the order instruction itself via `buildOrder`.
 */
export class SolanaTradingSdk {
  constructor(private readonly options: SolanaTradingSdkOptions = {}) {}

  /**
   * Builds the SPL `approve` instruction that delegates `sellAmount` of `sellTokenAddress` to the
   * settlement program, without sending it — see "Step 0" in the README for why this is required
   * before an order on a given sell-token account can settle. Bundle it with `buildOrder`'s
   * instruction in the same transaction the first time a wallet trades a given token.
   */
  approveCowProtocol(params: ApproveCowProtocolParams): TransactionInstruction {
    const owner = new PublicKey(params.ownerAddress)
    const sellMint = new PublicKey(params.sellTokenAddress)
    const tokenProgramId = params.sellTokenProgramId ? new PublicKey(params.sellTokenProgramId) : undefined

    const sellTokenAccount = getAssociatedTokenAddressSync(sellMint, owner, false, tokenProgramId)
    const delegate = getSolanaDelegateAuthority(this.options.env)

    return createApproveInstruction(sellTokenAccount, delegate, owner, params.approveAmount, undefined, tokenProgramId)
  }

  /**
   * Builds the `CancelOrder` instruction for an order at `orderPda`, without sending it — see
   * `buildCancelOrderInstruction` for the on-chain semantics. Cancelling is idempotent.
   */
  cancelOrder(params: CancelOrderParams): TransactionInstruction {
    return buildCancelOrderInstruction({
      programId: getSolanaSettlementProgramId(this.options.env),
      owner: new PublicKey(params.ownerAddress),
      orderPda: new PublicKey(params.orderPda),
      intent: params.intent,
      createdBy: params.createdByAddress ? new PublicKey(params.createdByAddress) : undefined,
    })
  }

  /**
   * Builds one `CancelOrder` instruction per entry in `paramsList`, without sending them. There is no
   * dedicated batch-cancel instruction in the settlement program, so cancelling several orders atomically
   * means bundling their individual `CancelOrder` instructions into one transaction yourself — Solana
   * transactions hold multiple instructions natively, and shared accounts (`owner`, `createdBy`, the
   * System Program) are deduplicated when the transaction is compiled. A legacy transaction is capped at
   * 1232 bytes, so very large batches may need to be split across multiple transactions.
   */
  cancelOrders(paramsList: CancelOrderParams[]): TransactionInstruction[] {
    return paramsList.map((params) => this.cancelOrder(params))
  }

  /**
   * Builds a limit order at the caller's own price, without going through `getQuote` — see
   * `buildSolanaLimitOrderOrder`. Uses the constructor-bound `env` unless `params.env` overrides it.
   */
  buildLimitOrder(params: SolanaLimitOrderParams): Promise<SolanaSwapOrder> {
    return buildSolanaLimitOrderOrder({ env: this.options.env, ...params })
  }

  async getQuote(params: SolanaQuoteParameters, advancedSettings?: SwapAdvancedSettings): Promise<SolanaQuoteAndPost> {
    const quote = await getSolanaQuote(params, {
      env: this.options.env,
      orderBookApi: this.options.orderBookApi,
      advancedSettings,
    })

    return {
      quoteResults: quote.quoteResults,
      solanaQuote: quote.solanaQuote,
      buildOrder: (advancedSettings?: SwapAdvancedSettings, options?: BuildSolanaSwapOrderOptions) =>
        buildSolanaSwapOrder(quote, advancedSettings, options),
      postSwapOrderFromQuote: (
        signAndSend: SolanaSignAndSend,
        advancedSettings?: SwapAdvancedSettings,
        signingStepManager?: SigningStepManager,
      ) => postSolanaSwapOrderFromQuote(quote, signAndSend, advancedSettings, signingStepManager),
      postSponsoredOrder: (transaction: string) =>
        postSolanaSponsoredOrder(
          // The endpoint reports `id: null` when it fails to store a quote, which the generated type
          // does not admit — normalize it away rather than posting an explicit null.
          { transaction, quoteId: quote.quoteResults.quoteResponse.id ?? undefined },
          { env: this.options.env, orderBookApi: this.options.orderBookApi },
        ),
    }
  }
}
