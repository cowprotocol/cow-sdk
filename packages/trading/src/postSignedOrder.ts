import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { log } from '@cowprotocol/sdk-common'
import { OrderToSubmit } from './getOrderToSubmit'
import { OrderPostingResult } from './types'

/**
 * Result of {@link postSignedOrder}: the subset of {@link OrderPostingResult} that a signer-less
 * submission produces. `txHash` and `orderToSign` don't apply here — the order is off-chain and
 * the caller already holds the signed struct via `getOrderToSubmit`.
 */
export type PostSignedOrderResult = Pick<OrderPostingResult, 'orderId' | 'signingScheme' | 'signature'>

/**
 * Submits an externally signed order to the order book.
 *
 * Counterpart of {@link getOrderToSubmit} for flows where the order is signed outside the SDK
 * (cold wallets or MPC/custody services): uploads the order's app-data document and then
 * sends the order.
 *
 * @param orderBookApi - The order book API instance to submit through. Must point to the same
 * chain and environment the quote was requested on.
 * @param orderToSubmit - Order body from {@link getOrderToSubmit}.
 * @param signature - Signature produced externally over `quoteResults.orderTypedData`
 * (`eth_signTypedData_v4`) by the order's `from` account.
 * @returns The created order's UID together with the submitted signature and signing scheme.
 *
 * @example
 * ```typescript
 * const quoteResults = await sdk.getQuoteOnly({ owner, ...tradeParameters })
 * const orderToSubmit = getOrderToSubmit(quoteResults)
 *
 * const signature = await signInYourEnvironment(quoteResults.orderTypedData)
 *
 * const { orderId } = await postSignedOrder(orderBookApi, orderToSubmit, signature)
 * ```
 */
export async function postSignedOrder(
  orderBookApi: OrderBookApi,
  orderToSubmit: OrderToSubmit,
  signature: string,
): Promise<PostSignedOrderResult> {
  const { appData, appDataHash } = orderToSubmit

  // getOrderToSubmit always emits the full document + hash pair, but tolerate a hand-built
  // order in the legacy hash-only form, where there is no document to upload
  if (appDataHash && appData !== appDataHash) {
    log('Uploading app-data')
    await orderBookApi.uploadAppData(appDataHash, appData)
  }

  log('Posting order...')

  const orderId = await orderBookApi.sendOrder({ ...orderToSubmit, signature })

  log(`Order created, id: ${orderId}`)

  return { orderId, signature, signingScheme: orderToSubmit.signingScheme }
}
