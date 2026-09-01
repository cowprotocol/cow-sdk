import { PublicKey, SystemProgram } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { buildCreateOrderInstruction } from './createOrderInstruction'
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

describe('buildCreateOrderInstruction', () => {
  const programId = fillPubkey(0x01)
  const createdBy = fillPubkey(0x66)
  const orderPda = fillPubkey(0x77)

  const instruction = buildCreateOrderInstruction({ programId, owner: intent.owner, createdBy, orderPda, intent })

  it('targets the settlement program', () => {
    expect(instruction.programId.toBase58()).toBe(programId.toBase58())
  })

  it('encodes discriminator 2 followed by the 213-byte intent', () => {
    expect(instruction.data[0]).toBe(2)
    expect(instruction.data.length).toBe(1 + 213)
    expect(Uint8Array.from(instruction.data.subarray(1))).toEqual(encodeOrderIntent(intent))
  })

  it('lists accounts in the order the settlement program expects: owner, created_by, order_pda, system program', () => {
    expect(instruction.keys).toEqual([
      { pubkey: intent.owner, isSigner: true, isWritable: false },
      { pubkey: createdBy, isSigner: true, isWritable: true },
      { pubkey: orderPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ])
  })
})
