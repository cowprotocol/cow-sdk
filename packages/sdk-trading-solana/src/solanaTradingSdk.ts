import { getSolanaQuote } from './getSolanaQuote'
import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { SolanaOrderPostingResult, SolanaQuote, SolanaQuoteParameters, SolanaSignAndSend } from './types'

export interface SolanaTradingSdkOptions {
  signAndSend: SolanaSignAndSend
}

export interface SolanaQuoteAndPost {
  quote: SolanaQuote
  postSwapOrderFromQuote(): Promise<SolanaOrderPostingResult>
}

/**
 * Solana counterpart to `TradingSdk`. Unlike the EVM SDK, which gets its signer implicitly from a
 * global adapter set once at app startup, Solana has no such adapter — `signAndSend` is bound at
 * construction instead, so callers get the same `sdk.getQuote(...)` → `.postSwapOrderFromQuote()`
 * shape without threading a signer through every call.
 */
export class SolanaTradingSdk {
  constructor(private readonly options: SolanaTradingSdkOptions) {}

  async getQuote(params: SolanaQuoteParameters): Promise<SolanaQuoteAndPost> {
    const quote = await getSolanaQuote(params)

    return {
      quote,
      postSwapOrderFromQuote: () => postSolanaSwapOrderFromQuote(quote, this.options.signAndSend),
    }
  }
}
