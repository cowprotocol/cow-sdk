import { CowEnv, PartialApiContext, SupportedChainId } from '@cowprotocol/sdk-config'

/**
 * The request context every Solana order-book call carries, both when building a default client and
 * as a per-request override so a client supplied for another chain still reaches Solana.
 *
 * `env` is left out rather than set to `undefined`: spreading it would overwrite the client's `prod`
 * default, and anything other than `prod` resolves to the staging base urls.
 */
export function solanaApiContext(env?: CowEnv): PartialApiContext {
  return {
    chainId: SupportedChainId.SOLANA,
    ...(env ? { env } : undefined),
  }
}
