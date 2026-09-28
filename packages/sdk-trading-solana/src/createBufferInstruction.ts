import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'

/** Wire discriminator for `CreateBuffer`, per `SettlementInstruction::CreateBuffer` (= 4) in cow-settlement-interface. */
const CREATE_BUFFER_DISCRIMINATOR = 4

export interface CreateBufferInstructionParams {
  programId: PublicKey
  /** Funds each new buffer's rent; must sign the transaction. */
  payer: PublicKey
  /**
   * The program owning every mint in `buffers`. One instruction carries a single token program, so
   * mints split across the classic SPL Token program and Token-2022 need one instruction each.
   */
  tokenProgram: PublicKey
  /** Each mint paired with its canonical buffer PDA — see `findBufferPda`. */
  buffers: Array<{ bufferPda: PublicKey; mint: PublicKey }>
}

/**
 * Builds the `CreateBuffer` instruction, matching `CreateBuffers::into::<Instruction>()` in
 * cow-settlement-interface: `data = [discriminator=4]` and accounts
 * `[payer (writable signer), system_program, token_program, (buffer_pda (writable), mint)...]`.
 *
 * The mints are implied by the accounts, so the instruction carries no further data. Creation is
 * idempotent: an existing buffer is left untouched and the instruction still succeeds, so two parties
 * racing to create the same one both succeed.
 */
export function buildCreateBufferInstruction(params: CreateBufferInstructionParams): TransactionInstruction {
  if (params.buffers.length === 0) {
    throw new Error('buildCreateBufferInstruction: no buffers to create')
  }

  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: params.tokenProgram, isSigner: false, isWritable: false },
      ...params.buffers.flatMap(({ bufferPda, mint }) => [
        { pubkey: bufferPda, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
      ]),
    ],
    data: Buffer.from([CREATE_BUFFER_DISCRIMINATOR]),
  })
}
