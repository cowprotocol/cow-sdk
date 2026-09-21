import type { OrderPostingResult, QuoteResults, SigningStepManager, SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import { CowEnv } from '@cowprotocol/sdk-config'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { createApproveInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'
import { buildSolanaSwapOrder, SolanaSwapOrder } from './buildSwapOrder'
import { getSolanaQuote } from './getSolanaQuote'
import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { getSolanaDelegateAuthority } from './statePda'
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

/**
 * Solana counterpart to `QuoteAndPost`. It additionally exposes `solanaQuote` and `buildOrder`, because a
 * Solana order is a plain instruction: callers may want to bundle it with a wrap or a token delegation and
 * submit one transaction, rather than have the SDK send it alone.
 */
export interface SolanaQuoteAndPost {
  quoteResults: QuoteResults
  solanaQuote: SolanaQuote
  /** Build the `CreateOrder` instruction without sending it, to bundle with other instructions. */
  buildOrder(advancedSettings?: SwapAdvancedSettings): Promise<SolanaSwapOrder>
  /** Build, sign and submit the order as its own transaction. */
  postSwapOrderFromQuote(
    signAndSend: SolanaSignAndSend,
    advancedSettings?: SwapAdvancedSettings,
    signingStepManager?: SigningStepManager,
  ): Promise<OrderPostingResult>
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

  async getQuote(params: SolanaQuoteParameters, advancedSettings?: SwapAdvancedSettings): Promise<SolanaQuoteAndPost> {
    const quote = await getSolanaQuote(params, {
      env: this.options.env,
      orderBookApi: this.options.orderBookApi,
      advancedSettings,
    })

    return {
      quoteResults: quote.quoteResults,
      solanaQuote: quote.solanaQuote,
      buildOrder: (advancedSettings?: SwapAdvancedSettings) => buildSolanaSwapOrder(quote, advancedSettings),
      postSwapOrderFromQuote: (
        signAndSend: SolanaSignAndSend,
        advancedSettings?: SwapAdvancedSettings,
        signingStepManager?: SigningStepManager,
      ) => postSolanaSwapOrderFromQuote(quote, signAndSend, advancedSettings, signingStepManager),
    }
  }
}
