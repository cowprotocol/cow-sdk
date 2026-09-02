import type { QuoteAndPost, SigningStepManager, SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import { getSolanaQuote } from './getSolanaQuote'
import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { SolanaQuoteParameters, SolanaSignAndSend } from './types'

export interface SolanaTradingSdkOptions {
  signAndSend: SolanaSignAndSend
}

/**
 * Solana counterpart to `TradingSdk`. Unlike the EVM SDK, which gets its signer implicitly from a
 * global adapter set once at app startup, Solana has no such adapter — `signAndSend` is bound at
 * construction instead, so callers get the same `sdk.getQuote(...)` → `.postSwapOrderFromQuote()`
 * shape without threading a signer through every call.
 */
export class SolanaTradingSdk {
  constructor(private readonly options: SolanaTradingSdkOptions) {}

  async getQuote(params: SolanaQuoteParameters): Promise<QuoteAndPost> {
    const quote = await getSolanaQuote(params)

    return {
      quoteResults: quote.quoteResults,
      postSwapOrderFromQuote: (advancedSettings?: SwapAdvancedSettings, signingStepManager?: SigningStepManager) =>
        postSolanaSwapOrderFromQuote(quote, this.options.signAndSend, advancedSettings, signingStepManager),
    }
  }
}
