import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'

import { encodeOrderIntent, SolanaOrderIntent } from './orderIntent'

/** Wire discriminator for `CancelOrder`, per `SettlementInstruction::CancelOrder` (= 11) in cow-settlement-interface. */
const CANCEL_ORDER_DISCRIMINATOR = 11

export interface CancelOrderInstructionParams {
  programId: PublicKey
  /** Authenticates the cancellation; must match the order's intent owner and sign the transaction. */
  owner: PublicKey
  /** The canonical PDA for the order being cancelled — see `findOrderPda`. */
  orderPda: PublicKey
  /**
   * Present only to create the order already cancelled if `orderPda` doesn't exist on-chain yet —
   * mirrors `CreateOrder`'s intent. Omit for the cheaper, more common case of cancelling an order that's
   * already on-chain: its data is recovered from `orderPda` and only its `cancelled` flag is set.
   */
  intent?: SolanaOrderIntent
  /**
   * Funds the order PDA's rent and must sign when `intent` is given; unused (and doesn't need to sign)
   * when `intent` is omitted. Defaults to `owner`.
   */
  createdBy?: PublicKey
}

/**
 * Builds the `CancelOrder` instruction, matching `CancelOrder::into::<Instruction>()` in
 * cow-settlement-interface: `data = [discriminator=11]`, optionally followed by the 213 encoded intent
 * bytes when `intent` is given. Accounts `[owner (readonly signer), created_by, order_pda (writable),
 * system_program]` — `created_by` is a writable signer only when `intent` is present.
 *
 * Cancelling is idempotent: cancelling an already-cancelled order does nothing.
 */
export function buildCancelOrderInstruction(params: CancelOrderInstructionParams): TransactionInstruction {
  const createdBy = params.createdBy ?? params.owner
  const hasIntent = params.intent !== undefined

  let data: Buffer
  if (hasIntent) {
    const intentBytes = encodeOrderIntent(params.intent as SolanaOrderIntent)
    data = Buffer.alloc(1 + intentBytes.length)
    data[0] = CANCEL_ORDER_DISCRIMINATOR
    data.set(intentBytes, 1)
  } else {
    data = Buffer.from([CANCEL_ORDER_DISCRIMINATOR])
  }

  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.owner, isSigner: true, isWritable: false },
      { pubkey: createdBy, isSigner: hasIntent, isWritable: hasIntent },
      { pubkey: params.orderPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  })
}
