import type {
  SwapAdvancedSettings,
  SigningStepManager,
  OrderPostingResult,
  QuoteResults,
} from '@cowprotocol/sdk-trading'
import { buildCreateOrderInstruction } from './createOrderInstruction'
import { toHex } from './orderIntent'
import { SolanaQuote, SolanaSignAndSend } from './types'
import { SigningScheme } from '@cowprotocol/sdk-order-book'

// TODO: implement real order posting flow, see https://github.com/cowprotocol/cowswap/pull/7860
/**
 * Builds the real `CreateOrder` instruction for `quote` and has the caller sign and submit it. This is
 * the Solana analogue of `postSwapOrderFromQuote` in `postSwapOrder.ts` — but where the EVM version signs
 * order data and POSTs it to the CoW order-book, Solana orders are created entirely on-chain, so this
 * builds a transaction instruction instead of a signed order body. `createdBy` is always `quote.intent.owner`:
 * a single connected wallet both authenticates and funds the order's rent.
 */
export async function postSolanaSwapOrderFromQuote(
  {quoteResults, solanaQuote}: { quoteResults: QuoteResults; solanaQuote: SolanaQuote },
  signAndSend: SolanaSignAndSend,
  advancedSettings?: SwapAdvancedSettings,
  signingStepManager?: SigningStepManager,
): Promise<OrderPostingResult> {
  const intent = { ...solanaQuote.intent }

  if (advancedSettings?.quoteRequest) {
    const { validTo } = advancedSettings.quoteRequest

    // TODO: Why intent doesn't have receiver?
    // if (receiver) intent.receiver = receiver
    if (validTo) intent.validTo = validTo
  }

  const instruction = buildCreateOrderInstruction({
    programId: solanaQuote.programId,
    owner: solanaQuote.intent.owner,
    createdBy: solanaQuote.intent.owner,
    orderPda: solanaQuote.orderPda,
    intent: solanaQuote.intent,
  })

  signingStepManager?.beforeOrderSign?.()

  const { signature } = await signAndSend(instruction)

  signingStepManager?.afterOrderSign?.()

  const orderToSign = quoteResults.orderToSign

  return { orderId: toHex(solanaQuote.uid), txHash: signature, signature, signingScheme: SigningScheme.PRESIGN, orderToSign }
}
