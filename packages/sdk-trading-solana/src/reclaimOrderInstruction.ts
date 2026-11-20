import { PublicKey, TransactionInstruction } from '@solana/web3.js'

/** Wire discriminator for `ReclaimOrder`, per `SettlementInstruction::ReclaimOrder` (= 5) in cow-settlement-interface. */
const RECLAIM_ORDER_DISCRIMINATOR = 5

export interface ReclaimOrderInstructionParams {
  programId: PublicKey
  /** The canonical PDA for the order being closed — see `findOrderPda`. */
  orderPda: PublicKey
  /** Receives the rent lamports; must be the `created_by` recorded in the order PDA. */
  reclaimRecipient: PublicKey
  /**
   * Signs the reclaim. Until the order's `validTo` has passed only its owner may reclaim, and only once
   * the order is cancelled or completely filled; afterwards anyone may reclaim on the recipient's behalf.
   */
  caller: PublicKey
}

/**
 * Builds the `ReclaimOrder` instruction, which closes the order PDA and sends its rent lamports to
 * `reclaimRecipient`: `data = [discriminator=5]`, accounts
 * `[order_pda (writable), reclaim_recipient (writable), caller (signer)]`.
 *
 * The recipient is checked against the order body rather than chosen, so a reclaim can only ever pay the
 * account that funded the rent.
 */
export function buildReclaimOrderInstruction(params: ReclaimOrderInstructionParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.orderPda, isSigner: false, isWritable: true },
      { pubkey: params.reclaimRecipient, isSigner: false, isWritable: true },
      { pubkey: params.caller, isSigner: true, isWritable: false },
    ],
    data: Buffer.from([RECLAIM_ORDER_DISCRIMINATOR]),
  })
}
