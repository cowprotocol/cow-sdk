import {
  CowEnv,
  SOLANA_SETTLEMENT_PROGRAM_VERSION,
  SOLANA_SETTLEMENT_PROGRAM_VERSION_STAGING,
} from '@cowprotocol/sdk-config'

const SETTLEMENT_SEED_PREFIX = 'settlement v'
/** Fixed width reserved for the version string after the prefix, matching `SETTLEMENT_SEED_VERSION_LEN`
 * in cow-settlement-interface. A fixed-width seed avoids prefix collisions between versions. */
const SETTLEMENT_SEED_VERSION_LEN = 7

function buildSettlementSeed(version: string): Uint8Array {
  // `padEnd` doesn't truncate, so an over-wide version would silently widen the seed and derive a PDA the
  // program never signs as. Mirrors the compile-time assert in `build_padded_settlement_seed`.
  if (version.length > SETTLEMENT_SEED_VERSION_LEN) {
    throw new Error(
      `Settlement program version "${version}" exceeds the ${SETTLEMENT_SEED_VERSION_LEN}-byte seed field`,
    )
  }

  return new TextEncoder().encode(SETTLEMENT_SEED_PREFIX + version.padEnd(SETTLEMENT_SEED_VERSION_LEN, ' '))
}

const SETTLEMENT_SEEDS: Record<CowEnv, Uint8Array> = {
  prod: buildSettlementSeed(SOLANA_SETTLEMENT_PROGRAM_VERSION),
  staging: buildSettlementSeed(SOLANA_SETTLEMENT_PROGRAM_VERSION_STAGING),
}

/**
 * Version-embedded seed shared by every settlement-program PDA of `env` (`SETTLEMENT_SEED` in
 * cow-settlement-interface). Keyed by env because the version is a property of a deployment: each env's seed
 * has to be derived from the version of the program id that env resolves to.
 *
 * Returns a copy: the cached seeds are mutable `Uint8Array`s, and a caller writing into one would silently
 * corrupt every later derivation for that env.
 */
export function getSettlementSeed(env: CowEnv = 'prod'): Uint8Array {
  return SETTLEMENT_SEEDS[env].slice()
}
