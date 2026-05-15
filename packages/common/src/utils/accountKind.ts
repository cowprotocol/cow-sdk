import { AbstractProviderAdapter } from '../adapters/AbstractProviderAdapter'

/**
 * Classification of an account's on-chain shape, from CoW's signing-scheme
 * perspective.
 *
 * - `eoa`: no code at the address. Sign EIP-712 off-chain, CoW verifies with
 *   `ecrecover`.
 * - `delegated-eoa-plain`: EIP-7702 set-code marker (`0xef0100 || delegate`)
 *   whose delegate returns raw ECDSA from `signTypedData_v4`. EIP-712 path
 *   works because the inner ECDSA still recovers to the EOA address.
 * - `delegated-eoa-wrapping`: EIP-7702 marker whose delegate forces signature
 *   wrapping at sign time — ERC-7739 nested typed data, ERC-7579 / Modular
 *   Account v2 validator prefix, or both. The bytes from `signTypedData_v4`
 *   do NOT `ecrecover` to the owner. Verify via the owner's
 *   `isValidSignature` (EIP-1271 + EIP-7702 dispatch to the delegate).
 * - `contract`: deployed smart contract (Safe, custom AA wallet). Today the
 *   common path is `setPreSignature` on-chain (`presign`).
 */
export type AccountKind = 'eoa' | 'delegated-eoa-plain' | 'delegated-eoa-wrapping' | 'contract'

/**
 * Lookup table for delegate addresses known to force signature wrapping on
 * `signTypedData_v4`. Addresses may be provided as checksum or lowercase,
 * with or without `0x`; lookups are case-insensitive.
 *
 * Membership causes `classifyAccount` to return `delegated-eoa-wrapping`
 * instead of `delegated-eoa-plain`. Integrators add addresses as they
 * confirm a delegate's wallet returns wrapped bytes (e.g. by inspecting
 * the byte length and shape of a sample signature).
 */
export interface WrappingDelegateRegistry {
  readonly wrappingDelegates: ReadonlySet<string>
}

/**
 * Normalize an address-like string for registry comparison: strip `0x` and
 * lowercase. No format validation — the caller is expected to provide a
 * hex address.
 */
function normalizeDelegateAddress(address: string): string {
  const lower = address.toLowerCase()
  return lower.startsWith('0x') ? lower.slice(2) : lower
}

/**
 * Build a `WrappingDelegateRegistry` from a list of delegate addresses,
 * tolerating checksum casing and `0x` prefix.
 */
export function makeWrappingDelegateRegistry(addresses: Iterable<string>): WrappingDelegateRegistry {
  const set = new Set<string>()
  for (const address of addresses) {
    set.add(normalizeDelegateAddress(address))
  }
  return { wrappingDelegates: set }
}

/**
 * Default empty registry. Vendors / integrators are expected to merge their
 * own allowlist; CoW does not maintain a canonical list.
 */
export const DEFAULT_WRAPPING_DELEGATES: WrappingDelegateRegistry = makeWrappingDelegateRegistry([])

const EIP7702_DELEGATION_PREFIX = '0xef0100'
const EIP7702_DELEGATION_HEX_LENGTH = 2 + 23 * 2 // "0x" + 23 bytes

/**
 * True if `code` matches the EIP-7702 set-code marker exactly:
 * `0xef0100 || delegate_address` (23 bytes total).
 */
export function isEip7702DelegationCode(code: string): boolean {
  if (!code) return false
  const lower = code.toLowerCase()
  return lower.length === EIP7702_DELEGATION_HEX_LENGTH && lower.startsWith(EIP7702_DELEGATION_PREFIX)
}

/**
 * Extracts the 20-byte delegate address (lowercase hex, no `0x`) from a
 * canonical EIP-7702 set-code marker. Returns `null` if `code` is not a
 * delegation marker.
 */
export function extractEip7702Delegate(code: string): string | null {
  if (!isEip7702DelegationCode(code)) return null
  // Skip "0x" + "ef0100"
  return code.slice(2 + 6).toLowerCase()
}

/**
 * Classifies an account by inspecting on-chain code at `owner`.
 *
 * Reads `getCode(owner)` once. Pure function over the result — no caching;
 * callers should cache for performance if they need to. The classification
 * is the input to CoW signing-scheme selection:
 *
 * - `eoa`, `delegated-eoa-plain` -> `SigningScheme.EIP712`
 * - `delegated-eoa-wrapping`     -> `SigningScheme.EIP1271` with the wallet's
 *                                   raw bytes forwarded as the signature
 *                                   (see `signOrderForWrappingDelegate`).
 * - `contract`                   -> `SigningScheme.PRESIGN` (today's default
 *                                   for Safes; off-chain EIP-1271 is also
 *                                   possible if the wallet supports it).
 *
 * @param adapter Provider adapter exposing `getCode`.
 * @param owner Address to classify (the order owner).
 * @param registry Allowlist of wrapping delegates. Defaults to empty.
 */
export async function classifyAccount(
  adapter: Pick<AbstractProviderAdapter, 'getCode'>,
  owner: string,
  registry: WrappingDelegateRegistry = DEFAULT_WRAPPING_DELEGATES,
): Promise<AccountKind> {
  const code = (await adapter.getCode(owner)) || '0x'

  if (code === '0x') return 'eoa'

  const delegate = extractEip7702Delegate(code)
  if (delegate !== null) {
    // `extractEip7702Delegate` returns lowercased hex without `0x`, which is
    // the same shape `makeWrappingDelegateRegistry` produces.
    return registry.wrappingDelegates.has(delegate) ? 'delegated-eoa-wrapping' : 'delegated-eoa-plain'
  }

  return 'contract'
}
