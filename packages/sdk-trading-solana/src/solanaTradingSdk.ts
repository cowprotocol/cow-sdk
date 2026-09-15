import type { OrderPostingResult, QuoteResults, SigningStepManager, SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import { CowEnv } from '@cowprotocol/sdk-config'
import { buildSolanaSwapOrder, SolanaSwapOrder } from './buildSwapOrder'
import { getSolanaQuote } from './getSolanaQuote'
import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { SolanaQuote, SolanaQuoteParameters, SolanaSignAndSend } from './types'

export interface SolanaTradingSdkOptions {
  env?: CowEnv
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

  async getQuote(params: SolanaQuoteParameters): Promise<SolanaQuoteAndPost> {
    const quote = await getSolanaQuote(params, { env: this.options.env })

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
