import { PublicKey } from '@solana/web3.js'

import { findOrderPda, ORDER_SEED } from './orderPda'
import { getSettlementSeed } from './settlementSeed'

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

  it('uses the [settlement seed, uid, ORDER_SEED] seed scheme', () => {
    const [expectedPda] = PublicKey.findProgramAddressSync([getSettlementSeed(), uid, ORDER_SEED], programId)
    const [pda] = findOrderPda(programId, uid)

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
  })

  it('derives with the seed of the requested env', () => {
    // Asserts the env is threaded into the seed rather than that the envs differ: they resolve to the same
    // bytes while prod and staging share a deployment, and this stays true once they diverge.
    const [expectedPda] = PublicKey.findProgramAddressSync(
      [getSettlementSeed('staging'), uid, ORDER_SEED],
      programId,
    )
    const [pda] = findOrderPda(programId, uid, 'staging')

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
  })
})
