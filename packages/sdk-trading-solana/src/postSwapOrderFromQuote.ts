import type {
  SwapAdvancedSettings,
  SigningStepManager,
  OrderPostingResult,
  QuoteResults,
} from '@cowprotocol/sdk-trading'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { buildCreateOrderInstruction } from './createOrderInstruction'
import { encodeOrderIntent, hashOrderIntent, toHex } from './orderIntent'
import { findOrderPda } from './orderPda'
import { SolanaQuote, SolanaSignAndSend } from './types'
import { SigningScheme } from '@cowprotocol/sdk-order-book'
import { PublicKey } from '@solana/web3.js'

// TODO: implement real order posting flow, see https://github.com/cowprotocol/cowswap/pull/7860
/**
 * Builds the real `CreateOrder` instruction for `quote` and has the caller sign and submit it. This is
 * the Solana analogue of `postSwapOrderFromQuote` in `postSwapOrder.ts` — but where the EVM version signs
 * order data and POSTs it to the CoW order-book, Solana orders are created entirely on-chain, so this
 * builds a transaction instruction instead of a signed order body. `createdBy` is always `quote.intent.owner`:
 * a single connected wallet both authenticates and funds the order's rent.
 */
export async function postSolanaSwapOrderFromQuote(
  { quoteResults, solanaQuote }: { quoteResults: QuoteResults; solanaQuote: SolanaQuote },
  signAndSend: SolanaSignAndSend,
  advancedSettings?: SwapAdvancedSettings,
  signingStepManager?: SigningStepManager,
): Promise<OrderPostingResult> {
  const intent = { ...solanaQuote.intent }
  let uid = solanaQuote.uid
  let orderPda = solanaQuote.orderPda

  if (advancedSettings?.quoteRequest) {
    const { validTo, receiver } = advancedSettings.quoteRequest

    if (receiver) {
      intent.buyTokenAccount = getAssociatedTokenAddressSync(
        intent.buyMint,
        new PublicKey(receiver),
        false,
        solanaQuote.buyTokenProgramId,
      )
    }
    if (validTo) intent.validTo = validTo

    // `uid`/`orderPda` are the hash/PDA of the *quoted* intent bytes — re-derive them whenever the
    // intent is overridden so the posted order PDA still matches the intent actually being created.
    if (receiver || validTo) {
      const intentBytes = encodeOrderIntent(intent)
      uid = await hashOrderIntent(intentBytes)
      ;[orderPda] = findOrderPda(solanaQuote.programId, uid)
    }
  }

  const instruction = buildCreateOrderInstruction({
    programId: solanaQuote.programId,
    owner: intent.owner,
    createdBy: intent.owner,
    orderPda,
    intent,
  })

  await signingStepManager?.beforeOrderSign?.()

  const { signature } = await signAndSend(instruction)

  await signingStepManager?.afterOrderSign?.()

  const orderToSign = quoteResults.orderToSign

  return {
    orderId: toHex(uid),
    txHash: signature,
    signature,
    signingScheme: SigningScheme.PRESIGN,
    orderToSign,
  }
}
