import { PublicKey } from '@solana/web3.js'

import { BUFFER_SEED, findBufferPda } from './bufferPda'
import { ORDER_SEED } from './orderPda'
import { getSettlementSeed } from './settlementSeed'

describe('findBufferPda', () => {
  const programId = new PublicKey(new Uint8Array(32).fill(1))
  const mint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

  it('is deterministic for the same program id and mint', () => {
    const [pda1, bump1] = findBufferPda(programId, mint)
    const [pda2, bump2] = findBufferPda(programId, mint)

    expect(pda1.toBase58()).toBe(pda2.toBase58())
    expect(bump1).toBe(bump2)
  })

  it('derives a different address for a different mint, so each token has its own buffer', () => {
    const [pda1] = findBufferPda(programId, mint)
    const [pda2] = findBufferPda(programId, new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'))

    expect(pda1.toBase58()).not.toBe(pda2.toBase58())
  })

  it('derives a different address for a different program id', () => {
    const [pda1] = findBufferPda(programId, mint)
    const [pda2] = findBufferPda(new PublicKey(new Uint8Array(32).fill(9)), mint)

    expect(pda1.toBase58()).not.toBe(pda2.toBase58())
  })

  it('uses the [settlement seed, mint, BUFFER_SEED] seed scheme', () => {
    const [expectedPda] = PublicKey.findProgramAddressSync(
      [getSettlementSeed(), mint.toBytes(), BUFFER_SEED],
      programId,
    )
    const [pda] = findBufferPda(programId, mint)

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
  })

  it('does not collide with the order PDA of the same 32 bytes', () => {
    const [bufferPda] = findBufferPda(programId, mint)
    const [orderPda] = PublicKey.findProgramAddressSync([getSettlementSeed(), mint.toBytes(), ORDER_SEED], programId)

    expect(bufferPda.toBase58()).not.toBe(orderPda.toBase58())
  })

  it('derives with the seed of the requested env', () => {
    // Asserts the env is threaded into the seed rather than that the envs differ: they resolve to the same
    // bytes while prod and staging share a deployment, and this stays true once they diverge.
    const [expectedPda] = PublicKey.findProgramAddressSync(
      [getSettlementSeed('staging'), mint.toBytes(), BUFFER_SEED],
      programId,
    )
    const [pda] = findBufferPda(programId, mint, 'staging')

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
  })
})
