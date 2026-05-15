import { ProtocolOptions, SupportedChainId } from '@cowprotocol/sdk-config'
import { ContractsOrder, normalizeOrder, ORDER_TYPE_FIELDS } from '@cowprotocol/sdk-contracts-ts'
import { AbstractSigner } from '@cowprotocol/sdk-common'

import { UnsignedOrder } from './types'
import { getDomain } from './utils'

/**
 * Produce a CoW order signature for an EIP-7702 delegated EOA whose delegate
 * wraps signatures at sign time (ERC-7739 nested typed-data, ERC-7579 /
 * Modular Account v2 validator prefix, or both).
 *
 * The wallet's `signTypedData` returns bytes that do NOT `ecrecover` to the
 * owner — they only verify via the owner's `isValidSignature`, which EIP-7702
 * routes to the delegate. The bytes are forwarded verbatim with no further
 * wrapping (unlike the `(order, sig)` ABI tuple used for adapter-style
 * EIP-1271 verifiers).
 *
 * Intended use as the `customEIP1271Signature` callback in
 * `postCoWProtocolTrade`:
 *
 * ```ts
 * await postCoWProtocolTrade(orderBookApi, appData, params, {
 *   signingScheme: SigningScheme.EIP1271,
 *   customEIP1271Signature: (order, signer) =>
 *     signOrderForWrappingDelegate(order, chainId, signer),
 * })
 * ```
 *
 * Use `classifyAccount` from `@cowprotocol/sdk-common` to decide when to
 * route through this path.
 *
 * @param order The unsigned order to sign.
 * @param chainId The chain id (drives the CoW settlement EIP-712 domain).
 * @param signer The owner's signer.
 * @param options Optional protocol overrides (env, settlement contract).
 * @returns Raw wallet bytes — suitable as an EIP-1271 signature against the
 *          owner address.
 */
export async function signOrderForWrappingDelegate<Provider>(
  order: UnsignedOrder,
  chainId: SupportedChainId,
  signer: AbstractSigner<Provider>,
  options?: ProtocolOptions,
): Promise<string> {
  const domain = getDomain(chainId, options)
  // Normalize to match the canonical EIP-712 payload used everywhere else
  // (fills `sellTokenBalance`/`buyTokenBalance` defaults, hashes `appData`).
  const normalized = normalizeOrder(order as unknown as ContractsOrder)
  return signer.signTypedData(domain, { Order: ORDER_TYPE_FIELDS }, normalized as unknown as Record<string, unknown>)
}
