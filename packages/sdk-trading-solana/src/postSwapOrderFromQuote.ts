import { buildCreateOrderInstruction } from './createOrderInstruction'
import { toHex } from './orderIntent'
import { SolanaOrderPostingResult, SolanaQuote, SolanaSignAndSend } from './types'

// TODO: implement real order posting flow, see https://github.com/cowprotocol/cowswap/pull/7860
/**
 * Builds the real `CreateOrder` instruction for `quote` and has the caller sign and submit it. This is
 * the Solana analogue of `postSwapOrderFromQuote` in `postSwapOrder.ts` — but where the EVM version signs
 * order data and POSTs it to the CoW order-book, Solana orders are created entirely on-chain, so this
 * builds a transaction instruction instead of a signed order body. `createdBy` is always `quote.intent.owner`:
 * a single connected wallet both authenticates and funds the order's rent.
 */
export async function postSolanaSwapOrderFromQuote(
  quote: SolanaQuote,
  signAndSend: SolanaSignAndSend,
): Promise<SolanaOrderPostingResult> {
  const instruction = buildCreateOrderInstruction({
    programId: quote.programId,
    owner: quote.intent.owner,
    createdBy: quote.intent.owner,
    orderPda: quote.orderPda,
    intent: quote.intent,
  })

  const { signature } = await signAndSend(instruction)

  return { orderId: toHex(quote.uid), txHash: signature }
}
