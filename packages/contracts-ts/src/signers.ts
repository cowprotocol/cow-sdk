import { AbstractSigner, getGlobalAdapter, Signer } from '@cowprotocol/sdk-common'

/**
 * Wrapper around a TypedDataSigner Signer object that implements `_signTypedData`. It allows to specify the version of
 * EIP-712 used.
 *
 * Takes a Signer instance on creation.
 * All other Signer methods are proxied to initial instance.
 */
export function getTypedDataVersionedSigner(signer: Signer, version: 'v3' | 'v4'): AbstractSigner {
  const adapter = getGlobalAdapter()
  return new adapter.TypedDataVersionedSigner(signer, version)
}

/**
 * Wrapper around a TypedDataSigner Signer object that implements `_signTypedData` using
 * `eth_signTypedData_v3` instead of `eth_signTypedData_v4`.
 *
 * Takes a Signer instance on creation.
 * All other Signer methods are proxied to initial instance.
 */
export function getTypedDataV3Signer(signer: Signer): AbstractSigner {
  const adapter = getGlobalAdapter()
  return new adapter.TypedDataV3Signer(signer)
}

/**
 * Wrapper around a TypedDataSigner Signer object that implements `_signTypedData` using
 * `eth_signTypedData_v4` as usual.
 * The difference here is that the domain `chainId` is transformed to a `number`.
 * That's done to circumvent a bug introduced in the latest Metamask version (9.6.0)
 * that no longer accepts a string for domain `chainId`.
 * See for more details https://github.com/MetaMask/metamask-extension/issues/11308.
 *
 * Takes a Signer instance on creation.
 * All other Signer methods are proxied to initial instance.
 */
export function getIntChainIdTypedDataV4Signer(signer: Signer): AbstractSigner {
  const adapter = getGlobalAdapter()
  return new adapter.IntChainIdTypedDataV4Signer(signer)
}
