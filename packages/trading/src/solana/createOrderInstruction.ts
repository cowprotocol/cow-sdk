import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'

import { encodeOrderIntent, SolanaOrderIntent } from './orderIntent'

/** Wire discriminator for `CreateOrder`, per `SettlementInstruction::CreateOrder` (= 2) in cow-settlement-interface. */
const CREATE_ORDER_DISCRIMINATOR = 2

export interface CreateOrderInstructionParams {
  programId: PublicKey
  /** Authenticates the order; must match `intent.owner` and sign the transaction. */
  owner: PublicKey
  /** Funds the new order PDA's rent; must sign the transaction. May equal `owner`. */
  createdBy: PublicKey
  /** The canonical PDA for `intent`'s uid — see `findOrderPda`. */
  orderPda: PublicKey
  intent: SolanaOrderIntent
}

/**
 * Builds the `CreateOrder` instruction, matching `CreateOrder::into::<Instruction>()` in
 * cow-settlement-interface: `data = [discriminator=2, ...213 intent bytes]`, accounts
 * `[owner (readonly signer), created_by (writable signer), order_pda (writable), system_program]`.
 */
export function buildCreateOrderInstruction(params: CreateOrderInstructionParams): TransactionInstruction {
  const intentBytes = encodeOrderIntent(params.intent)
  const data = Buffer.alloc(1 + intentBytes.length)
  data[0] = CREATE_ORDER_DISCRIMINATOR
  data.set(intentBytes, 1)

  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.owner, isSigner: true, isWritable: false },
      { pubkey: params.createdBy, isSigner: true, isWritable: true },
      { pubkey: params.orderPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  })
}
