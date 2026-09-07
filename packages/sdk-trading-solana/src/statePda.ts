import { PublicKey } from '@solana/web3.js'
import { CowEnv, SOLANA_SETTLEMENT_PROGRAM_ID, SOLANA_SETTLEMENT_PROGRAM_ID_STAGING } from '@cowprotocol/sdk-config'

import { getSettlementSeed } from './settlementSeed'

/** Settlement program id deployed for `env`. */
export function getSolanaSettlementProgramId(env?: CowEnv): PublicKey {
  return new PublicKey(env === 'staging' ? SOLANA_SETTLEMENT_PROGRAM_ID_STAGING : SOLANA_SETTLEMENT_PROGRAM_ID)
}

/**
 * Derives the canonical settlement state PDA and bump, matching `find_state_pda` in
 * cow-settlement-interface. The env's settlement seed is its only seed, so the address moves with every
 * major/minor bump of the settlement program.
 *
 * `env` selects the seed version and must describe the same deployment as `programId`. Prefer
 * `getSolanaDelegateAuthority`, which derives both from one env and so cannot mismatch.
 */
export function findSettlementStatePda(programId: PublicKey, env?: CowEnv): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([getSettlementSeed(env)], programId)
}

/**
 * The SPL delegate a sell-token account has to approve before the settlement program can move its
 * funds — the Solana analogue of the EVM vault relayer spender.
 *
 * This is the settlement state PDA, not the program id: the program signs its token CPIs as that PDA,
 * so approving anything else yields a delegate that cannot move the funds. Because the PDA seed carries
 * the program's major/minor version, every delegation has to be renewed after a version bump.
 */
export function getSolanaDelegateAuthority(env?: CowEnv): PublicKey {
  return findSettlementStatePda(getSolanaSettlementProgramId(env), env)[0]
}
