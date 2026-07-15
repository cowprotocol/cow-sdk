import { OrderCreation, SigningScheme } from '@cowprotocol/sdk-order-book'
import { QuoteResults } from './types'
import { getIsEthFlowOrder } from './utils/misc'

/**
 * An order ready to be sent to `OrderBookApi.sendOrder` once a `signature` is attached.
 */
export type OrderToSubmit = Omit<OrderCreation, 'signature'>

/**
 * The subset of {@link QuoteResults} read by {@link getOrderToSubmit}.
 * A deserialized or partial quote result works, as long as these fields are present.
 */
export type GetOrderToSubmitParams = Pick<
  QuoteResults,
  'orderToSign' | 'appDataInfo' | 'quoteResponse' | 'tradeParameters'
>

/**
 * Builds the order body for `OrderBookApi.sendOrder` from a quote, for flows where the order
 * is signed externally (cold wallets or MPC/custody services) and no signer is ever
 * passed to the SDK.
 *
 * The returned order is the quote-time `orderToSign` struct verbatim: the external signature
 * covers exactly those bytes, so nothing is recomputed here. In particular the app-data is
 * frozen — to trade with different app-data, request a new quote and sign again.
 *
 * @param quoteResults - Quote results from `TradingSdk.getQuoteOnly` (or `getQuote`).
 * Must be bound to an owner via `tradeParameters.owner`.
 * @returns Order body ready for `sendOrder` once a `signature` is attached.
 * @throws If the quote has no owner, or if it sells the native token (such orders go through
 * the EthFlow contract, see `getEthFlowTransaction`, and cannot be submitted to the order book).
 *
 * @example
 * ```typescript
 * const quoteResults = await sdk.getQuoteOnly({ owner, ...tradeParameters })
 * const orderToSubmit = getOrderToSubmit(quoteResults)
 *
 * // Sign quoteResults.orderTypedData in your own environment (EIP-712)
 * const signature = await signInYourEnvironment(quoteResults.orderTypedData)
 *
 * await sdk.postSignedOrder(orderToSubmit, signature)
 * ```
 */
export function getOrderToSubmit(quoteResults: GetOrderToSubmitParams): OrderToSubmit {
  const { orderToSign, appDataInfo, quoteResponse, tradeParameters } = quoteResults
  const { owner } = tradeParameters

  if (!owner) {
    throw new Error(
      'getOrderToSubmit requires tradeParameters.owner. ' +
        'Request the quote via getQuoteOnly({ owner, ... }) so it is bound to the account that will sign it.',
    )
  }

  if (getIsEthFlowOrder(tradeParameters)) {
    throw new Error(
      'Orders selling the native token cannot be submitted to the order book. Use getEthFlowTransaction instead.',
    )
  }

  return {
    ...orderToSign,
    from: owner,
    signingScheme: SigningScheme.EIP712,
    quoteId: quoteResponse.id ?? null,
    // orderToSign.appData is the appData hash (that is what gets signed), but the order book
    // expects the full document in `appData` and the hash in `appDataHash`
    appData: appDataInfo.fullAppData,
    appDataHash: appDataInfo.appDataKeccak256,
  }
}
