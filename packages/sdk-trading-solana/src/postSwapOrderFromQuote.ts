import type { SwapAdvancedSettings, SigningStepManager, OrderPostingResult } from '@cowprotocol/sdk-trading'
import { BuildSolanaSwapOrderOptions, buildSolanaSwapOrder, SolanaSwapOrderQuote } from './buildSwapOrder'
import { SolanaSignAndSend } from './types'

// TODO: implement real order posting flow, see https://github.com/cowprotocol/cowswap/pull/7860
/**
 * Builds `quote`'s `CreateOrder` instruction and has `signAndSend` submit it as its own transaction. This
 * is the Solana analogue of `postSwapOrderFromQuote` in `postSwapOrder.ts` — but where the EVM version
 * signs order data and POSTs it to the CoW order-book, Solana orders are created entirely on-chain.
 *
 * To bundle the order with other instructions instead of sending it alone, use `buildSolanaSwapOrder`.
 */
export async function postSolanaSwapOrderFromQuote(
  quote: SolanaSwapOrderQuote,
  signAndSend: SolanaSignAndSend,
  advancedSettings?: SwapAdvancedSettings,
  signingStepManager?: SigningStepManager,
  options: BuildSolanaSwapOrderOptions = {},
): Promise<OrderPostingResult> {
  if (options.sponsor) {
    throw new Error('A sponsored order is signed by the backend and goes to the order book, not to an RPC')
  }

  const { instruction, orderId, signingScheme, orderToSign } = await buildSolanaSwapOrder(quote, advancedSettings)

  await signingStepManager?.beforeOrderSign?.()

  const { signature } = await signAndSend(instruction)

  await signingStepManager?.afterOrderSign?.()

  return {
    orderId,
    txHash: signature,
    signature,
    signingScheme,
    orderToSign,
  }
}
