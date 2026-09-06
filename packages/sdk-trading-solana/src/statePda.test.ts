import { PublicKey } from '@solana/web3.js'
import {
  SOLANA_SETTLEMENT_PROGRAM_ID,
  SOLANA_SETTLEMENT_PROGRAM_ID_STAGING,
  SOLANA_SETTLEMENT_PROGRAM_VERSION,
} from '@cowprotocol/sdk-config'

import { getSettlementSeed } from './settlementSeed'
import { findSettlementStatePda, getSolanaDelegateAuthority, getSolanaSettlementProgramId } from './statePda'

describe('getSolanaSettlementProgramId', () => {
  it('defaults to the prod program id', () => {
    expect(getSolanaSettlementProgramId().toBase58()).toBe(new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID).toBase58())
    expect(getSolanaSettlementProgramId('prod').toBase58()).toBe(new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID).toBase58())
  })

  it('returns the staging program id for the staging env', () => {
    expect(getSolanaSettlementProgramId('staging').toBase58()).toBe(
      new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID_STAGING).toBase58(),
    )
  })
})

describe('findSettlementStatePda', () => {
  const programId = new PublicKey(new Uint8Array(32).fill(1))

  it('uses the settlement seed as its only seed', () => {
    const [expectedPda, expectedBump] = PublicKey.findProgramAddressSync([getSettlementSeed()], programId)
    const [pda, bump] = findSettlementStatePda(programId)

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
    expect(bump).toBe(expectedBump)
  })

  it('derives with the seed of the requested env', () => {
    // Asserts the env is threaded into the seed rather than that the envs differ: they resolve to the same
    // bytes while prod and staging share a deployment, and this stays true once they diverge.
    const [expectedPda] = PublicKey.findProgramAddressSync([getSettlementSeed('staging')], programId)
    const [pda] = findSettlementStatePda(programId, 'staging')

    expect(pda.toBase58()).toBe(expectedPda.toBase58())
  })

  it('derives a different address for a different program id', () => {
    const [pda] = findSettlementStatePda(programId)
    const [otherPda] = findSettlementStatePda(new PublicKey(new Uint8Array(32).fill(9)))

    expect(pda.toBase58()).not.toBe(otherPda.toBase58())
  })
})

describe('getSolanaDelegateAuthority', () => {
  it('derives the state PDA the deployed settlement program signs as', () => {
    // Bumping the program version moves every PDA and invalidates existing delegations. Re-derive this
    // expectation with the release's own generated client (`findStatePdaPda`) before updating it.
    expect(SOLANA_SETTLEMENT_PROGRAM_VERSION).toBe('0.3')
    expect(getSolanaDelegateAuthority().toBase58()).toBe('9MM8zpg6xeDzgnzKJhgW2Jptd5yRk2NqBUigPZ6STWGz')
  })

  it('pairs each env program id with that same env seed', () => {
    const programId = getSolanaSettlementProgramId('staging')
    const delegate = getSolanaDelegateAuthority('staging')

    expect(delegate.toBase58()).toBe(findSettlementStatePda(programId, 'staging')[0].toBase58())
    expect(delegate.toBase58()).not.toBe(programId.toBase58())
  })
})
