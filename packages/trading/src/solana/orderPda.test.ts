import { PublicKey } from '@solana/web3.js'

import { findOrderPda, ORDER_SEED, SETTLEMENT_SEED } from './orderPda'

describe('SETTLEMENT_SEED', () => {
  it('is the settlement-program-version-embedded seed prefix', () => {
    // "settlement v" (12 bytes) + "0.3" right-padded to a fixed 7-byte version field = 19 bytes total,
    // matching `SETTLEMENT_SEED_LEN` in cow-settlement-interface.
    expect(SETTLEMENT_SEED.length).toBe(19)
    expect(new TextDecoder().decode(SETTLEMENT_SEED)).toBe('settlement v0.3    ')
  })
})

describe('findOrderPda', () => {
  const programId = new PublicKey(new Uint8Array(32).fill(1))
  const uid = new Uint8Array(32).fill(2)

  it('is deterministic for the same program id and uid', () => {
    const [pda1, bump1] = findOrderPda(programId, uid)
    const [pda2, bump2] = findOrderPda(programId, uid)

    expect(pda1.toBase58()).toBe(pda2.toBase58())
    expect(bump1).toBe(bump2)
  })

  it('derives a different address for a different uid', () => {
    const [pda1] = findOrderPda(programId, uid)
    const [pda2] = findOrderPda(programId, new Uint8Array(32).fill(3))

    expect(pda1.toBase58()).not.toBe(pda2.toBase58())
  })

  it('derives a different address for a different program id', () => {
    const [pda1] = findOrderPda(programId, uid)
    const [pda2] = findOrderPda(new PublicKey(new Uint8Array(32).fill(9)), uid)

    expect(pda1.toBase58()).not.toBe(pda2.toBase58())
  })

  it('uses the [SETTLEMENT_SEED, uid, ORDER_SEED] seed scheme', () => {
    const [expectedPda] = PublicKey.findProgramAddressSync([SETTLEMENT_SEED, uid, ORDER_SEED], programId)
    const [pda] = findOrderPda(programId, uid)

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
  })
})
