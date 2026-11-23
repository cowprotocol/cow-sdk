import { PublicKey } from '@solana/web3.js'

import { buildReclaimOrderInstruction } from './reclaimOrderInstruction'

function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

describe('buildReclaimOrderInstruction', () => {
  const programId = fillPubkey(0x01)
  const orderPda = fillPubkey(0x77)
  const owner = fillPubkey(0x11)
  const instruction = buildReclaimOrderInstruction({
    programId,
    orderPda,
    reclaimRecipient: owner,
    caller: owner,
  })

  it('targets the settlement program', () => {
    expect(instruction.programId.toBase58()).toBe(programId.toBase58())
  })

  it('encodes only discriminator 5', () => {
    expect(Uint8Array.from(instruction.data)).toEqual(Uint8Array.from([5]))
  })

  it('writes the order PDA and the recipient, and has the caller sign', () => {
    expect(instruction.keys).toEqual([
      { pubkey: orderPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ])
  })

  it('keeps the recipient separate from the caller when the rent was funded by someone else', () => {
    const sponsor = fillPubkey(0x66)
    const sponsored = buildReclaimOrderInstruction({
      programId,
      orderPda,
      reclaimRecipient: sponsor,
      caller: owner,
    })

    expect(sponsored.keys).toEqual([
      { pubkey: orderPda, isSigner: false, isWritable: true },
      { pubkey: sponsor, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ])
  })
})
