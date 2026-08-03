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
export type QuoteResultsForOrderToSubmit = Pick<
  QuoteResults,
  'orderToSign' | 'appDataInfo' | 'quoteResponse' | 'tradeParameters'
>

/**
 * Builds the order body for `OrderBookApi.sendOrder` from a quote, for flows where the order
 * is signed externally (cold wallets or MPC/custody services) and no signer is ever
 * passed to the SDK.
 *
 * @see TradingSdk.getOrderToSubmit for the documented entry point.
 */
export function getOrderToSubmit(
  quoteResults: QuoteResultsForOrderToSubmit,
  signingScheme: SigningScheme = SigningScheme.EIP712,
): OrderToSubmit {
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

  // This flow submits a pre-computed off-chain signature. PRESIGN and EIP1271 can't be fulfilled
  // that way — PRESIGN needs an on-chain setPreSignature tx, EIP1271 needs signature wrapping and
  // on-chain verification — so reject them here instead of failing confusingly at the order book.
  // External EIP1271 / smart-account support is planned as a later milestone (P3).
  if (signingScheme === SigningScheme.PRESIGN) {
    throw new Error(
      'PRESIGN orders are validated by an on-chain transaction, not a signature. Use getPreSignTransaction instead.',
    )
  }
  if (signingScheme === SigningScheme.EIP1271) {
    throw new Error(
      'EIP-1271 (smart-account) signatures are not yet supported by getOrderToSubmit; support is planned for a later milestone.',
    )
  }

  return {
    ...orderToSign,
    from: owner,
    signingScheme,
    quoteId: quoteResponse.id ?? null,
    // orderToSign.appData is the appData hash (that is what gets signed), but the order book
    // expects the full document in `appData` and the hash in `appDataHash`
    appData: appDataInfo.fullAppData,
    appDataHash: appDataInfo.appDataKeccak256,
  }
}
