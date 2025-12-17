import { AbstractSigner, getGlobalAdapter, Provider, type SignerLike } from '@cowprotocol/sdk-common'

export function resolveSigner(signer?: SignerLike): AbstractSigner<Provider> {
  const adapter = getGlobalAdapter()

  return signer ? adapter.createSigner(signer) : adapter.signer
}
