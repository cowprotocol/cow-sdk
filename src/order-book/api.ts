import 'cross-fetch/polyfill'
import {
  Address,
  NativePriceResponse,
  Order,
  OrderCancellations,
  OrderCreation,
  OrderQuoteRequest,
  OrderQuoteResponse,
  Trade,
  TransactionHash,
  UID,
} from './generated'
import { CowError } from '../common/cow-error'
import {
  ApiContext,
  CowEnv,
  DEFAULT_COW_API_CONTEXT,
  ApiBaseUrls,
  ENVS_LIST,
  PartialApiContext,
} from '../common/configs'
import { transformOrder } from './transformOrder'
import { EnrichedOrder } from './types'
import { SupportedChainId } from '../common/chains'
import { BackoffOptions } from 'exponential-backoff'
import { RateLimiter, RateLimiterOpts } from 'limiter'
import { FetchParams, OrderBookApiError, request } from './request'

export const ORDER_BOOK_PROD_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: 'https://api.cow.fi/mainnet',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://api.cow.fi/xdai',
  [SupportedChainId.GOERLI]: 'https://api.cow.fi/goerli',
}

export const ORDER_BOOK_STAGING_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: 'https://barn.api.cow.fi/mainnet',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://barn.api.cow.fi/xdai',
  [SupportedChainId.GOERLI]: 'https://barn.api.cow.fi/goerli',
}

// See config in https://www.npmjs.com/package/@insertish/exponential-backoff
const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  numOfAttempts: 10,
  maxDelay: Infinity,
  jitter: 'none',
}

// CowSwap order-book API is limited by 5 requests per second from one IP
const DEFAULT_LIMITER_OPTIONS: RateLimiterOpts = {
  tokensPerInterval: 5,
  interval: 'second',
}

export class OrderBookApi {
  public context: ApiContext

  private rateLimiter: RateLimiter

  constructor(
    context: PartialApiContext = {},
    limiterOpts: RateLimiterOpts = DEFAULT_LIMITER_OPTIONS,
    public readonly backoffOpts: BackoffOptions = DEFAULT_BACKOFF_OPTIONS
  ) {
    this.context = { ...DEFAULT_COW_API_CONTEXT, ...context }
    this.rateLimiter = new RateLimiter(limiterOpts)
  }

  getTrades(
    request: { owner?: Address; orderUid?: UID },
    contextOverride: PartialApiContext = {}
  ): Promise<Array<Trade>> {
    if (request.owner && request.orderUid) {
      return Promise.reject(new CowError('Cannot specify both owner and orderId'))
    }

    const query = new URLSearchParams(request)

    return this.fetch({ path: '/api/v1/trades', method: 'GET', query }, contextOverride)
  }

  getOrders(
    {
      owner,
      offset = 0,
      limit = 1000,
    }: {
      owner: Address
      offset?: number
      limit?: number
    },
    contextOverride: PartialApiContext = {}
  ): Promise<Array<EnrichedOrder>> {
    const query = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() })

    return this.fetch<Array<EnrichedOrder>>(
      { path: `/api/v1/account/${owner}/orders`, method: 'GET', query },
      contextOverride
    ).then((orders) => {
      return orders.map(transformOrder)
    })
  }

  getTxOrders(txHash: TransactionHash, contextOverride: PartialApiContext = {}): Promise<Array<EnrichedOrder>> {
    return this.fetch<Array<EnrichedOrder>>(
      { path: `/api/v1/transactions/${txHash}/orders`, method: 'GET' },
      contextOverride
    ).then((orders) => {
      return orders.map(transformOrder)
    })
  }

  getOrder(uid: UID, contextOverride: PartialApiContext = {}): Promise<EnrichedOrder> {
    return this.fetch<Order>({ path: `/api/v1/orders/${uid}`, method: 'GET' }, contextOverride).then((order) => {
      return transformOrder(order)
    })
  }

  getOrderMultiEnv(uid: UID, contextOverride: PartialApiContext = {}): Promise<EnrichedOrder> {
    const { env } = this.getContextWithOverride(contextOverride)
    const otherEnvs = ENVS_LIST.filter((i) => i !== env)

    let attemptsCount = 0

    const fallback = (error: Error | OrderBookApiError): Promise<EnrichedOrder> => {
      const nextEnv = otherEnvs[attemptsCount]

      if (error instanceof OrderBookApiError && error.response.status === 404 && nextEnv) {
        attemptsCount++

        return this.getOrder(uid, { ...contextOverride, env: nextEnv }).catch(fallback)
      }

      return Promise.reject(error)
    }

    return this.getOrder(uid, { ...contextOverride, env }).catch(fallback)
  }

  getQuote(requestBody: OrderQuoteRequest, contextOverride: PartialApiContext = {}): Promise<OrderQuoteResponse> {
    return this.fetch({ path: '/api/v1/quote', method: 'POST', body: requestBody }, contextOverride)
  }

  sendSignedOrderCancellations(
    requestBody: OrderCancellations,
    contextOverride: PartialApiContext = {}
  ): Promise<void> {
    return this.fetch({ path: '/api/v1/orders', method: 'DELETE', body: requestBody }, contextOverride)
  }

  sendOrder(requestBody: OrderCreation, contextOverride: PartialApiContext = {}): Promise<UID> {
    return this.fetch({ path: '/api/v1/orders', method: 'POST', body: requestBody }, contextOverride)
  }

  getNativePrice(tokenAddress: Address, contextOverride: PartialApiContext = {}): Promise<NativePriceResponse> {
    return this.fetch({ path: `/api/v1/token/${tokenAddress}/native_price`, method: 'GET' }, contextOverride)
  }

  getOrderLink(uid: UID, contextOverride?: PartialApiContext): string {
    const { chainId, env } = this.getContextWithOverride(contextOverride)
    return this.getApiBaseUrls(env)[chainId] + `/api/v1/orders/${uid}`
  }

  private getContextWithOverride(contextOverride: PartialApiContext = {}): ApiContext {
    return { ...this.context, ...contextOverride }
  }

  private getApiBaseUrls(env: CowEnv): ApiBaseUrls {
    if (this.context.baseUrls) return this.context.baseUrls

    return env === 'prod' ? ORDER_BOOK_PROD_CONFIG : ORDER_BOOK_STAGING_CONFIG
  }

  private fetch<T>(params: FetchParams, contextOverride: PartialApiContext = {}): Promise<T> {
    const { chainId, env } = this.getContextWithOverride(contextOverride)
    const baseUrl = this.getApiBaseUrls(env)[chainId]

    return request(baseUrl, params, this.rateLimiter, this.backoffOpts)
  }
}
