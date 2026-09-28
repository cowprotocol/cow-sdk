import { PublicKey, SystemProgram } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { buildCancelOrderInstruction } from './cancelOrderInstruction'
import { encodeOrderIntent, SolanaOrderIntent } from './orderIntent'

function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

const intent: SolanaOrderIntent = {
  owner: fillPubkey(0x11),
  buyTokenAccount: fillPubkey(0x22),
  buyMint: fillPubkey(0x33),
  sellTokenAccount: fillPubkey(0x44),
  sellMint: fillPubkey(0x55),
  sellAmount: 100n,
  buyAmount: 200n,
  validTo: 1_700_000_000,
  kind: OrderKind.SELL,
  partiallyFillable: false,
  createdOnChain: true,
  appData: new Uint8Array(32),
}

describe('buildCancelOrderInstruction', () => {
  const programId = fillPubkey(0x01)
  const orderPda = fillPubkey(0x77)

  describe('cancelling an order that already exists on-chain (no intent)', () => {
    const instruction = buildCancelOrderInstruction({ programId, owner: intent.owner, orderPda })

    it('targets the settlement program', () => {
      expect(instruction.programId.toBase58()).toBe(programId.toBase58())
    })

    it('encodes only discriminator 11, no intent bytes', () => {
      expect(Uint8Array.from(instruction.data)).toEqual(Uint8Array.from([11]))
    })

    it('leaves created_by unsigned and unwritten, defaulting it to owner', () => {
      expect(instruction.keys).toEqual([
        { pubkey: intent.owner, isSigner: true, isWritable: false },
        { pubkey: intent.owner, isSigner: false, isWritable: false },
        { pubkey: orderPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ])
    })
  })

  describe('creating the order already cancelled when it does not exist yet (intent given)', () => {
    const createdBy = fillPubkey(0x66)
    const instruction = buildCancelOrderInstruction({
      programId,
      owner: intent.owner,
      orderPda,
      intent,
      createdBy,
    })

    it('encodes discriminator 11 followed by the 213-byte intent', () => {
      expect(instruction.data[0]).toBe(11)
      expect(instruction.data.length).toBe(1 + 213)
      expect(Uint8Array.from(instruction.data.subarray(1))).toEqual(encodeOrderIntent(intent))
    })

    it('makes created_by a writable signer, to fund the PDA rent', () => {
      expect(instruction.keys).toEqual([
        { pubkey: intent.owner, isSigner: true, isWritable: false },
        { pubkey: createdBy, isSigner: true, isWritable: true },
        { pubkey: orderPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ])
    })
  })
})
