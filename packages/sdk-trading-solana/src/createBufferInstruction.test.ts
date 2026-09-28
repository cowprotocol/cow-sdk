import { PublicKey, SystemProgram } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'

import { buildCreateBufferInstruction } from './createBufferInstruction'

function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

describe('buildCreateBufferInstruction', () => {
  const programId = fillPubkey(0x01)
  const payer = fillPubkey(0x02)
  const mint = fillPubkey(0x03)
  const bufferPda = fillPubkey(0x04)

  const instruction = buildCreateBufferInstruction({
    programId,
    payer,
    tokenProgram: TOKEN_PROGRAM_ID,
    buffers: [{ bufferPda, mint }],
  })

  it('targets the settlement program', () => {
    expect(instruction.programId.toBase58()).toBe(programId.toBase58())
  })

  it('carries the discriminator and nothing else — the mints are implied by the accounts', () => {
    expect(Array.from(instruction.data)).toEqual([4])
  })

  it('lays out the shared accounts first and the buffer/mint pair after, as the program reads them', () => {
    expect(instruction.keys).toEqual([
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: bufferPda, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
    ])
  })

  it('creates several buffers in one instruction, pairs in the given order', () => {
    const second = { bufferPda: fillPubkey(0x05), mint: fillPubkey(0x06) }

    const multi = buildCreateBufferInstruction({
      programId,
      payer,
      tokenProgram: TOKEN_PROGRAM_ID,
      buffers: [{ bufferPda, mint }, second],
    })

    expect(multi.keys.slice(3)).toEqual([
      { pubkey: bufferPda, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: second.bufferPda, isSigner: false, isWritable: true },
      { pubkey: second.mint, isSigner: false, isWritable: false },
    ])
  })

  it('carries the caller-supplied token program, so Token-2022 mints are not created under the classic one', () => {
    const token2022 = buildCreateBufferInstruction({
      programId,
      payer,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      buffers: [{ bufferPda, mint }],
    })

    expect(token2022.keys.slice(0, 3)).toEqual([
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    ])
  })

  it('rejects an empty buffer list instead of sending an instruction that creates nothing', () => {
    expect(() =>
      buildCreateBufferInstruction({ programId, payer, tokenProgram: TOKEN_PROGRAM_ID, buffers: [] }),
    ).toThrow('no buffers to create')
  })
})
