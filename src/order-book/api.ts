import 'cross-fetch/polyfill'
import { RateLimiter } from 'limiter'
import { SupportedChainId } from '../common/chains'
import {
  ApiBaseUrls,
  ApiContext,
  CowEnv,
  DEFAULT_COW_API_CONTEXT,
  ENVS_LIST,
  PartialApiContext,
} from '../common/configs'
import { CowError } from '../common/cow-error'
import {
  Address,
  AppDataHash,
  AppDataObject,
  CompetitionOrderStatus,
  NativePriceResponse,
  Order,
  OrderCancellations,
  OrderCreation,
  OrderQuoteRequest,
  OrderQuoteResponse,
  SolverCompetitionResponse,
  TotalSurplus,
  Trade,
  TransactionHash,
  UID,
} from './generated'
import { DEFAULT_BACKOFF_OPTIONS, DEFAULT_LIMITER_OPTIONS, FetchParams, OrderBookApiError, request } from './request'
import { transformOrder } from './transformOrder'
import { EnrichedOrder } from './types'

/**
 * An object containing *production* environment base URLs for each supported `chainId`.
 * @see {@link https://api.cow.fi/docs/#/}
 */
export const ORDER_BOOK_PROD_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: 'https://api.cow.fi/mainnet',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://api.cow.fi/xdai',
  [SupportedChainId.ARBITRUM_ONE]: 'https://api.cow.fi/arbitrum_one',
  [SupportedChainId.BASE]: 'https://api.cow.fi/base',
  [SupportedChainId.SEPOLIA]: 'https://api.cow.fi/sepolia',
}

/**
 * An object containing *staging* environment base URLs for each supported `chainId`.
 */
export const ORDER_BOOK_STAGING_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: 'https://barn.api.cow.fi/mainnet',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://barn.api.cow.fi/xdai',
  [SupportedChainId.ARBITRUM_ONE]: 'https://barn.api.cow.fi/arbitrum_one',
  [SupportedChainId.BASE]: 'https://barn.api.cow.fi/base',
  [SupportedChainId.SEPOLIA]: 'https://barn.api.cow.fi/sepolia',
}

function cleanObjectFromUndefinedValues(obj: Record<string, string>): typeof obj {
  return Object.keys(obj).reduce((acc, key) => {
    const val = obj[key]
    if (typeof val !== 'undefined') acc[key] = val
    return acc
  }, {} as typeof obj)
}

/**
 * The parameters for the `getOrders` request.
 */
export type GetOrdersRequest = {
  owner: Address
  offset?: number
  limit?: number
}

/**
 * The CoW Protocol OrderBook API client.
 *
 * This is the main entry point for interacting with the CoW Protocol OrderBook API. The main advantage of using
 * this client is the batteries-included approach to interacting with the API. It handles:
 *
 * - Environment configuration (mainnet, staging, etc.)
 * - Rate limiting
 * - Retries
 * - Backoff
 * - Error handling
 * - Request signing
 * - Request validation
 *
 * @example
 *
 * ```typescript
 * import { OrderBookApi, OrderSigningUtils, SupportedChainId } from '@cowprotocol/cow-sdk'
 * import { Web3Provider } from '@ethersproject/providers'
 *
 * const account = 'YOUR_WALLET_ADDRESS'
 * const chainId = 100 // Gnosis chain
 * const provider = new Web3Provider(window.ethereum)
 * const signer = provider.getSigner()
 *
 * const quoteRequest = {
 *   sellToken: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', // WETH gnosis chain
 *   buyToken: '0x9c58bacc331c9aa871afd802db6379a98e80cedb', // GNO gnosis chain
 *   from: account,
 *   receiver: account,
 *   sellAmountBeforeFee: (0.4 * 10 ** 18).toString(), // 0.4 WETH
 *   kind: OrderQuoteSide.kind.SELL,
 * }
 *
 * const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.GNOSIS_CHAIN })
 *
 * async function main() {
 *     const { quote } = await orderBookApi.getQuote(quoteRequest)
 *
 *     const orderSigningResult = await OrderSigningUtils.signOrder(quote, chainId, signer)
 *
 *     const orderId = await orderBookApi.sendOrder({ ...quote, ...orderSigningResult })
 *
 *     const order = await orderBookApi.getOrder(orderId)
 *
 *     const trades = await orderBookApi.getTrades({ orderId })
 *
 *     const orderCancellationSigningResult = await OrderSigningUtils.signOrderCancellations([orderId], chainId, signer)
 *
 *     const cancellationResult = await orderBookApi.sendSignedOrderCancellations({...orderCancellationSigningResult, orderUids: [orderId] })
 *
 *     console.log('Results: ', { orderId, order, trades, orderCancellationSigningResult, cancellationResult })
 * }
 * ```
 *
 * @see {@link Swagger documentation https://api.cow.fi/docs/#/}
 * @see {@link OrderBook API https://github.com/cowprotocol/services}
 */
export class OrderBookApi {
  public context: ApiContext

  private rateLimiter: RateLimiter

  /**
   * Creates a new instance of the CoW Protocol OrderBook API client.
   * @param context - The API context to use. If not provided, the default context will be used.
   */
  constructor(context: PartialApiContext = {}) {
    this.context = { ...DEFAULT_COW_API_CONTEXT, ...context }
    this.rateLimiter = new RateLimiter(context.limiterOpts || DEFAULT_LIMITER_OPTIONS)
  }

  /**
   * Get the version of the API.
   * @param contextOverride Optional context override for this request.
   * @returns The version of the API.
   * @see {@link https://api.cow.fi/docs/#/default/get_api_v1_version}
   */
  getVersion(contextOverride: PartialApiContext = {}): Promise<string> {
    return this.fetch({ path: '/api/v1/version', method: 'GET' }, contextOverride)
  }

  /**
   * Get all the trades for either an `owner` **OR** `orderUid`.
   *
   * Given that an order *may* be partially fillable, it is possible that a discrete order (`orderUid`)
   * may have *multiple* trades. Therefore, this method returns a list of trades, either for *all* the orders
   * of a given `owner`, or for a discrete order (`orderUid`).
   * @param request Either an `owner` or an `orderUid` **MUST** be specified.
   * @param contextOverride Optional context override for this request.
   * @returns A list of trades matching the request.
   */
  getTrades(
    request: { owner?: Address; orderUid?: UID },
    contextOverride: PartialApiContext = {}
  ): Promise<Array<Trade>> {
    if (request.owner && request.orderUid) {
      return Promise.reject(new CowError('Cannot specify both owner and orderId'))
    } else if (!request.owner && !request.orderUid) {
      return Promise.reject(new CowError('Must specify either owner or orderId'))
    }

    const query = new URLSearchParams(cleanObjectFromUndefinedValues(request))

    return this.fetch({ path: '/api/v1/trades', method: 'GET', query }, contextOverride)
  }

  /**
   * Get a list of orders for a given `owner`.
   * @param request The request parameters with `request.offset = 0` and `request.limit = 1000` by default.
   * @param contextOverride Optional context override for this request.
   * @returns A list of orders matching the request.
   * @see {@link GetOrdersRequest}
   * @see {@link EnrichedOrder}
   */
  getOrders(
    { owner, offset = 0, limit = 1000 }: GetOrdersRequest,
    contextOverride: PartialApiContext = {}
  ): Promise<Array<EnrichedOrder>> {
    const query = new URLSearchParams(
      cleanObjectFromUndefinedValues({ offset: offset.toString(), limit: limit.toString() })
    )

    return this.fetch<Array<EnrichedOrder>>(
      { path: `/api/v1/account/${owner}/orders`, method: 'GET', query },
      contextOverride
    ).then((orders) => {
      return orders.map(transformOrder)
    })
  }

  /**
   * Get a list of orders from a given settlement transaction hash.
   * @param txHash The transaction hash.
   * @param contextOverride Optional context override for this request.
   * @returns A list of orders matching the request.
   * @see {@link EnrichedOrder}
   */
  getTxOrders(txHash: TransactionHash, contextOverride: PartialApiContext = {}): Promise<Array<EnrichedOrder>> {
    return this.fetch<Array<EnrichedOrder>>(
      { path: `/api/v1/transactions/${txHash}/orders`, method: 'GET' },
      contextOverride
    ).then((orders) => {
      return orders.map(transformOrder)
    })
  }

  /**
   * Get an order by its unique identifier, `orderUid`.
   * @param orderUid The unique identifier of the order.
   * @param contextOverride Optional context override for this request.
   * @returns The order matching the request.
   */
  getOrder(orderUid: UID, contextOverride: PartialApiContext = {}): Promise<EnrichedOrder> {
    return this.fetch<Order>({ path: `/api/v1/orders/${orderUid}`, method: 'GET' }, contextOverride).then((order) => {
      return transformOrder(order)
    })
  }

  /**
   * Get the order status while open
   */
  getOrderCompetitionStatus(orderUid: UID, contextOverride: PartialApiContext = {}): Promise<CompetitionOrderStatus> {
    return this.fetch({ path: `/api/v1/orders/${orderUid}/status`, method: 'GET' }, contextOverride)
  }

  /**
   * Attempt to get an order by its unique identifier, `orderUid`, from multiple environments.
   *
   * **NOTE**: The environment refers to either `prod` or `staging`. This allows a conveience method to
   * attempt to get an order from both environments, in the event that the order is not found in the
   * environment specified in the context.
   * @param orderUid The unique identifier of the order.
   * @param contextOverride Optional context override for this request.
   * @returns The order matching the request.
   * @throws {OrderBookApiError} If the order is not found in any of the environments.
   */
  getOrderMultiEnv(orderUid: UID, contextOverride: PartialApiContext = {}): Promise<EnrichedOrder> {
    const { env } = this.getContextWithOverride(contextOverride)
    const otherEnvs = ENVS_LIST.filter((i) => i !== env)

    let attemptsCount = 0

    const fallback = (error: Error | OrderBookApiError): Promise<EnrichedOrder> => {
      const nextEnv = otherEnvs[attemptsCount]

      if (error instanceof OrderBookApiError && error.response.status === 404 && nextEnv) {
        attemptsCount++

        return this.getOrder(orderUid, { ...contextOverride, env: nextEnv }).catch(fallback)
      }

      return Promise.reject(error)
    }

    return this.getOrder(orderUid, { ...contextOverride, env }).catch(fallback)
  }

  /**
   * Get a quote for an order.
   * This allows for the calculation of the total cost of an order, including fees, before signing and submitting.
   * @param requestBody The parameters for the order quote request.
   * @param contextOverride Optional context override for this request.
   * @returns A hydrated order matching the request ready to be signed.
   */
  getQuote(requestBody: OrderQuoteRequest, contextOverride: PartialApiContext = {}): Promise<OrderQuoteResponse> {
    return this.fetch({ path: '/api/v1/quote', method: 'POST', body: requestBody }, contextOverride)
  }

  /**
   * Cancel one or more orders.
   *
   * **NOTE**: Cancellation is on a best-effort basis. Orders that are already in the process of being settled
   * (ie. transaction has been submitted to chain by the solver) cannot not be cancelled.
   * **CAUTION**: This method can only be used to cancel orders that were signed using `EIP-712` or `eth_sign (EIP-191)`.
   * @param requestBody Orders to be cancelled and signed instructions to cancel them.
   * @param contextOverride Optional context override for this request.
   * @returns A list of order unique identifiers that were successfully cancelled.
   */
  sendSignedOrderCancellations(
    requestBody: OrderCancellations,
    contextOverride: PartialApiContext = {}
  ): Promise<void> {
    return this.fetch({ path: '/api/v1/orders', method: 'DELETE', body: requestBody }, contextOverride)
  }

  /**
   * Submit an order to the order book.
   * @param requestBody The signed order to be submitted.
   * @param contextOverride Optional context override for this request.
   * @returns The unique identifier of the order.
   */
  sendOrder(requestBody: OrderCreation, contextOverride: PartialApiContext = {}): Promise<UID> {
    return this.fetch({ path: '/api/v1/orders', method: 'POST', body: requestBody }, contextOverride)
  }

  /**
   * Get the native price of a token.
   *
   * **NOTE**: The native price is the price of the token in the native currency of the chain. For example, on Ethereum
   * this would be the price of the token in ETH.
   * @param tokenAddress The address of the ERC-20 token.
   * @param contextOverride Optional context override for this request.
   * @returns The native price of the token.
   */
  getNativePrice(tokenAddress: Address, contextOverride: PartialApiContext = {}): Promise<NativePriceResponse> {
    return this.fetch({ path: `/api/v1/token/${tokenAddress}/native_price`, method: 'GET' }, contextOverride)
  }

  /**
   * Given a user's address, get the total surplus that they have earned.
   * @param address The user's address
   * @param contextOverride Optional context override for this request.
   * @returns Calculated user's surplus
   */
  getTotalSurplus(address: Address, contextOverride: PartialApiContext = {}): Promise<TotalSurplus> {
    return this.fetch({ path: `/api/v1/users/${address}/total_surplus`, method: 'GET' }, contextOverride)
  }

  /**
   * Retrieve the full app data for a given app data hash.
   * @param appDataHash `bytes32` hash of the app data
   * @param contextOverride Optional context override for this request.
   * @returns Full app data that was uploaded
   */
  getAppData(appDataHash: AppDataHash, contextOverride: PartialApiContext = {}): Promise<AppDataObject> {
    return this.fetch({ path: `/api/v1/app_data/${appDataHash}`, method: 'GET' }, contextOverride)
  }

  /**
   * Upload the full app data that corresponds to a given app data hash.
   * @param appDataHash `bytes32` hash of the app data
   * @param fullAppData Full app data to be uploaded
   * @param contextOverride Optional context override for this request.
   * @returns The string encoding of the full app data that was uploaded.
   */
  uploadAppData(
    appDataHash: AppDataHash,
    fullAppData: string,
    contextOverride: PartialApiContext = {}
  ): Promise<AppDataObject> {
    return this.fetch(
      { path: `/api/v1/app_data/${appDataHash}`, method: 'PUT', body: { fullAppData } },
      contextOverride
    )
  }

  getSolverCompetition(auctionId: number, contextOverride?: PartialApiContext): Promise<SolverCompetitionResponse>

  getSolverCompetition(txHash: string, contextOverride?: PartialApiContext): Promise<SolverCompetitionResponse>

  /**
   * Given an auction id or tx hash, get the details of the solver competition for that auction.
   * @param auctionIdorTx auction id or tx hash corresponding to the auction
   * @param contextOverride Optional context override for this request.
   * @returns An object containing the solver competition details
   */
  getSolverCompetition(
    auctionIdorTx: number | string,
    contextOverride: PartialApiContext = {}
  ): Promise<SolverCompetitionResponse> {
    return this.fetch(
      {
        path: `/api/v1/solver_competition${typeof auctionIdorTx === 'string' ? '/by_tx_hash' : ''}/${auctionIdorTx}`,
        method: 'GET',
      },
      contextOverride
    )
  }

  /**
   * Generate an API endpoint for an order by its unique identifier, `orderUid`.
   * @param orderUid The unique identifier of the order.
   * @param contextOverride Optional context override for this request.
   * @returns The API endpoint to get the order.
   */
  getOrderLink(orderUid: UID, contextOverride?: PartialApiContext): string {
    const { chainId, env } = this.getContextWithOverride(contextOverride)
    return this.getApiBaseUrls(env)[chainId] + `/api/v1/orders/${orderUid}`
  }

  /**
   * Apply an override to the context for a request.
   * @param contextOverride Optional context override for this request.
   * @returns New context with the override applied.
   */
  private getContextWithOverride(contextOverride: PartialApiContext = {}): ApiContext {
    return { ...this.context, ...contextOverride }
  }

  /**
   * Get the base URLs for the API endpoints given the environment.
   * @param env The environment to get the base URLs for.
   * @returns The base URLs for the API endpoints.
   */
  private getApiBaseUrls(env: CowEnv): ApiBaseUrls {
    if (this.context.baseUrls) return this.context.baseUrls

    return env === 'prod' ? ORDER_BOOK_PROD_CONFIG : ORDER_BOOK_STAGING_CONFIG
  }

  /**
   * Make a request to the API.
   * @param params The parameters for the request.
   * @param contextOverride Optional context override for this request.
   * @returns The response from the API.
   */
  private fetch<T>(params: FetchParams, contextOverride: PartialApiContext = {}): Promise<T> {
    const { chainId, env, backoffOpts: _backoffOpts } = this.getContextWithOverride(contextOverride)
    const baseUrl = this.getApiBaseUrls(env)[chainId]
    const backoffOpts = _backoffOpts || DEFAULT_BACKOFF_OPTIONS
    const rateLimiter = contextOverride.limiterOpts ? new RateLimiter(contextOverride.limiterOpts) : this.rateLimiter

    return request(baseUrl, params, rateLimiter, backoffOpts)
  }
}
