import { CowEnv } from '@cowprotocol/sdk-config'
import { OrderUid, SolanaOrderBookApi, SolanaOrderCreation } from '@cowprotocol/sdk-order-book/solana'

import { solanaApiContext } from './apiContext'

export interface PostSolanaSponsoredOrderOptions {
  env?: CowEnv
  /** Overrides the default `SolanaOrderBookApi` instance — e.g. to supply a `bearerToken` or custom `baseUrls`. */
  orderBookApi?: SolanaOrderBookApi
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
): Promise<OrderUid> {
  const context = solanaApiContext(options.env)
  const orderBookApi = options.orderBookApi ?? new SolanaOrderBookApi(context)

  return orderBookApi.sendOrder(order, context)
}
