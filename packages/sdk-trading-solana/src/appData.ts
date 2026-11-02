import {
  AppDataParams,
  LatestAppDataDocVersion,
  MetadataApi,
  stringifyDeterministic,
} from '@cowprotocol/sdk-app-data'
import { getDefaultUtmParams, TradingAppDataInfo } from '@cowprotocol/sdk-trading'
import deepmerge from 'deepmerge'
import { keccak_256 } from '@noble/hashes/sha3'

import { toHex } from './orderIntent'

/** An app-data doc together with the 32 bytes `SolanaOrderIntent.appData` commits to on-chain. */
export interface SolanaAppDataInfo extends TradingAppDataInfo {
  appDataBytes: Uint8Array
}

export interface BuildSolanaAppDataParams {
  appCode: string
  /** Recorded in the doc's `quote` metadata; omitted when the slippage isn't known yet. */
  slippageBps?: number
}

/**
 * Digests an app-data doc into the 32 opaque bytes `SolanaOrderIntent.appData` carries on-chain.
 *
 * Uses the same keccak256 digest as EVM's `appData` (via `mergeAppDataDoc` in `@cowprotocol/sdk-trading`),
 * but computes it directly with `@noble/hashes` instead of an adapter's `keccak256`: every other function in
 * this package is deliberately adapter-free so a Solana-only integrator never needs an EVM provider configured.
 */
export async function hashAppDataDoc(doc: LatestAppDataDocVersion): Promise<Uint8Array> {
  const fullAppData = await stringifyDeterministic(doc)

  return keccak_256(new TextEncoder().encode(fullAppData))
}

/** `doc` with its deterministic JSON and digest — what the order book stores under the digest. */
export async function getSolanaAppDataInfo(doc: LatestAppDataDocVersion): Promise<SolanaAppDataInfo> {
  const fullAppData = await stringifyDeterministic(doc)
  const appDataBytes = keccak_256(new TextEncoder().encode(fullAppData))

  return { doc, fullAppData, appDataKeccak256: `0x${toHex(appDataBytes)}`, appDataBytes }
}

/**
 * The Solana counterpart of `buildAppData` in `@cowprotocol/sdk-trading`: the same doc (app code, slippage,
 * `market` order class, default UTM unless the caller sets its own) with `advancedParams` merged on top.
 * Partner fees are left out, since no Solana component charges them yet.
 */
export async function buildSolanaAppData(
  { appCode, slippageBps }: BuildSolanaAppDataParams,
  advancedParams?: AppDataParams,
): Promise<SolanaAppDataInfo> {
  const baseMetadata = {
    ...(slippageBps !== undefined ? { quote: { slippageBips: slippageBps } } : undefined),
    orderClass: { orderClass: 'market' as const },
    ...(advancedParams?.metadata?.utm ? undefined : { utm: getDefaultUtmParams() }),
  }

  const doc = await new MetadataApi().generateAppDataDoc(
    deepmerge<AppDataParams>({ appCode, metadata: baseMetadata }, advancedParams ?? {}),
  )

  return getSolanaAppDataInfo(doc)
}

function replaceArray<T>(_target: T[], source: T[]): T[] {
  return source
}

/** Merges `override` into `doc` and digests the result — see `hashAppDataDoc`. */
export async function mergeAppData(doc: LatestAppDataDocVersion, override: AppDataParams): Promise<SolanaAppDataInfo> {
  // Clear arrays that would otherwise be duplicated by deepmerge concatenating them with the override's.
  const clearedDoc = {
    ...doc,
    metadata: {
      ...doc.metadata,
      ...(override.metadata?.hooks ? { hooks: {} } : {}),
      ...(override.metadata?.userConsents ? { userConsents: [] } : {}),
    },
  }

  // The override's arrays replace the doc's: the quote's doc may already hold the same override (e.g. the
  // caller passed one `advancedSettings` to both `getQuote` and `buildOrder`), and concatenating would
  // duplicate entries such as `metadata.wrappers`.
  const merged = deepmerge(clearedDoc, override, { arrayMerge: replaceArray }) as LatestAppDataDocVersion

  return getSolanaAppDataInfo(merged)
}
