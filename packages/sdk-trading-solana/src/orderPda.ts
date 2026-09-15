import { PublicKey } from '@solana/web3.js'
import { CowEnv } from '@cowprotocol/sdk-config'

import { getSettlementSeed } from './settlementSeed'

/** Trailing seed identifying order PDAs (`ORDER_SEED` in cow-settlement-interface). */
export const ORDER_SEED = new TextEncoder().encode('order')

/**
 * Derives the canonical order PDA and bump for an order's `uid`, matching `find_order_pda` in
 * cow-settlement-interface.
 *
 * `env` selects the seed version and must describe the same deployment as `programId` — obtain the latter
 * from `getSolanaSettlementProgramId(env)` rather than pairing them by hand.
 */
export function findOrderPda(programId: PublicKey, uid: Uint8Array, env?: CowEnv): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([getSettlementSeed(env), uid, ORDER_SEED], programId)
}
