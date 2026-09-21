import { CowEnv, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi, SolanaOrderCreation, UID } from '@cowprotocol/sdk-order-book'

export interface PostSolanaSponsoredOrderOptions {
  env?: CowEnv
  /** Overrides the default `OrderBookApi` instance — e.g. to supply a `bearerToken` or custom `baseUrls`. */
  orderBookApi?: OrderBookApi
}

/**
 * Hands a sponsored order to the order book, which countersigns the transaction as its fee payer and
 * submits it. The transaction is the whole creation bundle — the preparation instructions the order
 * needs plus its trailing `CreateOrder` — signed by the owner and nothing else.
 *
 * The order only competes in auctions while the transaction's blockhash is alive, about a minute, so
 * sign it immediately before calling this rather than holding it.
 */
export function postSolanaSponsoredOrder(
  order: SolanaOrderCreation,
  options: PostSolanaSponsoredOrderOptions = {},
): Promise<UID> {
  // Spreading `env: undefined` would overwrite the client's `prod` default and resolve to staging,
  // so the key is only present when the caller set it.
  const context = {
    chainId: SupportedChainId.SOLANA,
    ...(options.env ? { env: options.env } : undefined),
  }
  const orderBookApi = options.orderBookApi ?? new OrderBookApi(context)

  return orderBookApi.sendSolanaOrder(order, context)
}
