import { PublicKey } from '@solana/web3.js'
import { CowEnv } from '@cowprotocol/sdk-config'

import { getSettlementSeed } from './settlementSeed'

/** Trailing seed identifying buffer PDAs (`BUFFER_SEED` in cow-settlement-interface). */
export const BUFFER_SEED = new TextEncoder().encode('buffer')

/**
 * Derives the canonical buffer PDA and bump for a token `mint` (`find_buffer_pda` in
 * cow-settlement-interface). A buffer is the per-token account settlement pays an order's buy side from.
 *
 * `env` selects the seed version and must describe the same deployment as `programId` — take the latter
 * from `getSolanaSettlementProgramId(env)`.
 */
export function findBufferPda(programId: PublicKey, mint: PublicKey, env?: CowEnv): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([getSettlementSeed(env), mint.toBytes(), BUFFER_SEED], programId)
}
