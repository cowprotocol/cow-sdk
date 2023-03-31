import 'cross-fetch/polyfill'
import {
  Address,
  ApiError,
  BaseHttpRequest,
  CancelablePromise,
  DefaultService,
  NativePriceResponse,
  OpenAPIConfig,
  OrderBookClient,
  OrderCancellations,
  OrderCreation,
  OrderPostError,
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
import { ApiRequestOptions } from './generated/core/ApiRequestOptions'
import { request as __request } from './generated/core/request'
import { SupportedChainId } from '../common/chains'

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

class FetchHttpRequest extends BaseHttpRequest {
  constructor(config: OpenAPIConfig) {
    super(config)
  }

  /**
   * Request method
   * @param options The request options from the service
   * @returns CancelablePromise<T>
   * @throws ApiError
   */
  public override request<T>(options: ApiRequestOptions): CancelablePromise<T> {
    return __request(this.config, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    })
  }
}

export class OrderBookApi {
  public context: ApiContext
  private servicePerNetwork: Record<string, OrderBookClient | null> = {}

  constructor(context: PartialApiContext = {}) {
    this.context = { ...DEFAULT_COW_API_CONTEXT, ...context }
  }

  getTrades(
    { owner, orderId }: { owner?: Address; orderId?: UID },
    contextOverride: PartialApiContext = {}
  ): CancelablePromise<Array<Trade>> {
    if (owner && orderId) {
      return new CancelablePromise((_, reject) => {
        reject(new CowError('Cannot specify both owner and orderId'))
      })
    }

    return this.getServiceForNetwork(contextOverride).getApiV1Trades(owner, orderId)
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
    return this.getServiceForNetwork(contextOverride)
      .getApiV1AccountOrders(owner, offset, limit)
      .then((orders) => {
        return orders.map(transformOrder)
      })
  }

  getTxOrders(txHash: TransactionHash, contextOverride: PartialApiContext = {}): Promise<Array<EnrichedOrder>> {
    return this.getServiceForNetwork(contextOverride)
      .getApiV1TransactionsOrders(txHash)
      .then((orders) => {
        return orders.map(transformOrder)
      })
  }

  getOrder(uid: UID, contextOverride: PartialApiContext = {}): Promise<EnrichedOrder> {
    return this.getServiceForNetwork(contextOverride)
      .getApiV1Orders(uid)
      .then((order) => {
        return transformOrder(order)
      })
  }

  getOrderMultiEnv(uid: UID, contextOverride: PartialApiContext = {}): Promise<EnrichedOrder> {
    const { env } = this.getContextWithOverride(contextOverride)
    const otherEnvs = ENVS_LIST.filter((i) => i !== env)

    let attemptsCount = 0

    const fallback = (error: Error): Promise<EnrichedOrder> => {
      const nextEnv = otherEnvs[attemptsCount]

      if (error instanceof ApiError && error.status === 404 && nextEnv) {
        attemptsCount++

        return this.getOrder(uid, { ...contextOverride, env: nextEnv }).catch(fallback)
      }

      return Promise.reject(error)
    }

    return this.getOrder(uid, { ...contextOverride, env }).catch(fallback)
  }

  getQuote(
    requestBody: OrderQuoteRequest,
    contextOverride: PartialApiContext = {}
  ): CancelablePromise<OrderQuoteResponse> {
    return this.getServiceForNetwork(contextOverride).postApiV1Quote(requestBody)
  }

  sendSignedOrderCancellations(
    requestBody: OrderCancellations,
    contextOverride: PartialApiContext = {}
  ): CancelablePromise<void> {
    return this.getServiceForNetwork(contextOverride).deleteApiV1Orders(requestBody)
  }

  sendOrder(requestBody: OrderCreation, contextOverride: PartialApiContext = {}): Promise<UID> {
    return this.getServiceForNetwork(contextOverride)
      .postApiV1Orders(requestBody)
      .catch((error) => {
        const body: OrderPostError = error.body

        if (body?.errorType) {
          throw new Error(body.errorType)
        }

        throw error
      })
  }

  getNativePrice(
    tokenAddress: Address,
    contextOverride: PartialApiContext = {}
  ): CancelablePromise<NativePriceResponse> {
    return this.getServiceForNetwork(contextOverride).getApiV1TokenNativePrice(tokenAddress)
  }

  getOrderLink(uid: UID, contextOverride?: PartialApiContext): string {
    const { chainId, env } = this.getContextWithOverride(contextOverride)
    return this.getApiBaseUrls(env)[chainId] + `/api/v1/orders/${uid}`
  }

  private getServiceForNetwork(contextOverride: PartialApiContext): DefaultService {
    const { chainId, env } = this.getContextWithOverride(contextOverride)
    const key = `${env}|${chainId}`
    const cached = this.servicePerNetwork[key]

    if (cached) return cached.default

    const client = new OrderBookClient({ BASE: this.getApiBaseUrls(env)[chainId] }, FetchHttpRequest)
    this.servicePerNetwork[key] = client

    return client.default
  }

  private getContextWithOverride(contextOverride: PartialApiContext = {}): ApiContext {
    return { ...this.context, ...contextOverride }
  }

  private getApiBaseUrls(env: CowEnv): ApiBaseUrls {
    if (this.context.baseUrls) return this.context.baseUrls

    return env === 'prod' ? ORDER_BOOK_PROD_CONFIG : ORDER_BOOK_STAGING_CONFIG
  }
}
