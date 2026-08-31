import { PublicKey } from '@solana/web3.js'
import { SOLANA_SETTLEMENT_PROGRAM_VERSION } from '@cowprotocol/sdk-config'

const SETTLEMENT_SEED_PREFIX = 'settlement v'
/** Fixed width reserved for the version string after the prefix, matching `SETTLEMENT_SEED_VERSION_LEN`
 * in cow-settlement-interface. A fixed-width seed avoids prefix collisions between versions. */
const SETTLEMENT_SEED_VERSION_LEN = 7

/**
 * Version-embedded seed shared by every settlement-program PDA (`SETTLEMENT_SEED` in
 * cow-settlement-interface). Must be regenerated if `SOLANA_SETTLEMENT_PROGRAM_VERSION` changes.
 */
export const SETTLEMENT_SEED = new TextEncoder().encode(
  SETTLEMENT_SEED_PREFIX + SOLANA_SETTLEMENT_PROGRAM_VERSION.padEnd(SETTLEMENT_SEED_VERSION_LEN, ' '),
)

/** Trailing seed identifying order PDAs (`ORDER_SEED` in cow-settlement-interface). */
export const ORDER_SEED = new TextEncoder().encode('order')

/**
 * Derives the canonical order PDA and bump for an order's `uid`, matching `find_order_pda` in
 * cow-settlement-interface.
 */
export function findOrderPda(programId: PublicKey, uid: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SETTLEMENT_SEED, uid, ORDER_SEED], programId)
}
