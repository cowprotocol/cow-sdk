import { DEFAULT_COW_API_CONTEXT, PartialApiContext, SupportedChainId } from '@cowprotocol/sdk-config'
import { CowError } from '@cowprotocol/sdk-common'
import { cleanObjectFromUndefinedValues, OrderBookApiBase } from './apiBase'
import { CompetitionOrderStatus, Order, OrderUid, QuoteRequest, QuoteResponse, Trade } from './generated/solana'
import { SolanaGetOrdersRequest, SolanaGetTradesRequest, SolanaOrderCreation } from './solanaTypes'

/**
 * The Solana order book API client.
 *
 * Separate from {@link OrderBookApi} because the two order books answer different shapes behind the
 * same paths: a Solana order carries token accounts, an order PDA and a creation block height, its
 * addresses are base58 pubkeys, and its statuses differ. The models come from the Solana order
 * book's own openapi.
 *
 * @example
 *
 * ```typescript
 * import { SolanaOrderBookApi } from '@cowprotocol/cow-sdk/solana'
 *
 * const api = new SolanaOrderBookApi()
 *
 * const { quote, funder } = await api.getQuote({
 *   from: owner,
 *   sellToken: sellMint,
 *   buyToken: buyMint,
 *   kind: OrderKind.SELL,
 *   sellAmountBeforeFee: '1000000',
 * })
 * const uid = await api.sendOrder({ partiallySignedTx })
 * const status = await api.getOrderCompetitionStatus(uid)
 * ```
 */
export class SolanaOrderBookApi extends OrderBookApiBase {
  constructor(context: PartialApiContext = {}) {
    super(context, { ...DEFAULT_COW_API_CONTEXT, chainId: SupportedChainId.SOLANA })
  }

  /**
   * Get a page of an owner's orders, newest first.
   * @param request The request parameters with `offset = 0` and `limit = 10` by default.
   * @param contextOverride Optional context override for this request.
   * @returns The owner's orders. A page shorter than `limit` is the last one.
   */
  getOrders(
    { owner, offset = 0, limit = 10 }: SolanaGetOrdersRequest,
    contextOverride: PartialApiContext = {},
  ): Promise<Array<Order>> {
    const query = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() })

    return this.fetch({ path: `/api/v1/account/${owner}/orders`, method: 'GET', query }, contextOverride)
  }

  /**
   * Get an order by its unique identifier, `orderUid`.
   * @param orderUid The order's 32-byte intent hash, `0x`-hex.
   * @param contextOverride Optional context override for this request.
   * @returns The order with its fill state.
   */
  getOrder(orderUid: OrderUid, contextOverride: PartialApiContext = {}): Promise<Order> {
    return this.fetch({ path: `/api/v1/orders/${orderUid}`, method: 'GET' }, contextOverride)
  }

  /**
   * Get the order's auction progress.
   * @param orderUid The order's 32-byte intent hash, `0x`-hex.
   * @param contextOverride Optional context override for this request.
   * @returns The auction progress.
   */
  getOrderCompetitionStatus(
    orderUid: OrderUid,
    contextOverride: PartialApiContext = {},
  ): Promise<CompetitionOrderStatus> {
    return this.fetch({ path: `/api/v1/orders/${orderUid}/status`, method: 'GET' }, contextOverride)
  }

  /**
   * Get the trades of one order **OR** one owner, newest first.
   * @param request Either an `owner` or an `orderUid` **MUST** be specified.
   * @param contextOverride Optional context override for this request.
   * @returns The trades. A page shorter than `limit` is the last one.
   */
  getTrades(request: SolanaGetTradesRequest, contextOverride: PartialApiContext = {}): Promise<Array<Trade>> {
    if (request.owner && request.orderUid) {
      return Promise.reject(new CowError('Cannot specify both owner and orderId'))
    } else if (!request.owner && !request.orderUid) {
      return Promise.reject(new CowError('Must specify either owner or orderId'))
    }

    const { offset = 0, limit = 10, ...rest } = request

    const params: Record<string, string> = { ...rest, offset: offset.toString(), limit: limit.toString() }

    const query = new URLSearchParams(cleanObjectFromUndefinedValues(params))

    return this.fetch({ path: '/api/v2/trades', method: 'GET', query }, contextOverride)
  }

  /**
   * Submit a sponsored order to the order book.
   *
   * Every order field derives from the transaction's trailing `CreateOrder` instruction, so the body
   * carries the transaction rather than the order.
   * @param requestBody The owner-signed, funder-unsigned creation transaction.
   * @param contextOverride Optional context override for this request.
   * @returns The order's unique identifier.
   */
  sendOrder(requestBody: SolanaOrderCreation, contextOverride: PartialApiContext = {}): Promise<OrderUid> {
    return this.fetch({ path: '/api/v1/orders', method: 'POST', body: requestBody }, contextOverride)
  }

  /**
   * Get a quote for an order.
   *
   * Indicative: nothing simulates the settlement, so `verified` is always false and the amounts are
   * not a commitment. The response's `funder` is the fee payer a sponsored creation must use.
   * @param requestBody The quote request.
   * @param contextOverride Optional context override for this request.
   * @returns The quote.
   */
  getQuote(requestBody: QuoteRequest, contextOverride: PartialApiContext = {}): Promise<QuoteResponse> {
    return this.fetch({ path: '/api/v1/quote', method: 'POST', body: requestBody }, contextOverride)
  }
}
