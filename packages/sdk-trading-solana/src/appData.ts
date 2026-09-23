import { AppDataParams, LatestAppDataDocVersion, stringifyDeterministic } from '@cowprotocol/sdk-app-data'
import deepmerge from 'deepmerge'

/**
 * Digests an app-data doc into the 32 opaque bytes `SolanaOrderIntent.appData` carries on-chain.
 *
 * Unlike EVM's `appData` (keccak256 of the doc, via `mergeAppDataDoc` in `@cowprotocol/sdk-trading`),
 * this hashes with the Web Crypto API instead of an adapter's `keccak256`: the settlement program treats
 * `appData` as opaque with no defined convention yet, and every other function in this package is
 * deliberately adapter-free so a Solana-only integrator never needs an EVM provider configured.
 */
export async function hashAppDataDoc(doc: LatestAppDataDocVersion): Promise<Uint8Array> {
  const fullAppData = await stringifyDeterministic(doc)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fullAppData))

  return new Uint8Array(digest)
}

/** Merges `override` into `doc` and digests the result — see `hashAppDataDoc`. */
export async function mergeAppData(doc: LatestAppDataDocVersion, override: AppDataParams): Promise<Uint8Array> {
  // Clear arrays that would otherwise be duplicated by deepmerge concatenating them with the override's.
  const clearedDoc = {
    ...doc,
    metadata: {
      ...doc.metadata,
      ...(override.metadata?.hooks ? { hooks: {} } : {}),
      ...(override.metadata?.userConsents ? { userConsents: [] } : {}),
    },
  }

  const merged = deepmerge(clearedDoc, override) as LatestAppDataDocVersion

  return hashAppDataDoc(merged)
}
