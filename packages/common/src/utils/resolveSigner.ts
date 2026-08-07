import { AbstractSigner, getGlobalAdapter, Provider, type SignerLike } from '../adapters'

/** Resolves a signer-like value through the global adapter, falling back to its configured signer. */
export function resolveSigner(signer?: SignerLike): AbstractSigner<Provider> {
  const adapter = getGlobalAdapter()
  return signer ? adapter.createSigner(signer) : adapter.signer
}
