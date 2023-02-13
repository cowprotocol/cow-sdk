import {
  Address,
  BaseHttpRequest,
  CancelablePromise,
  DefaultService,
  OpenAPIConfig,
  OrderBookClient,
  OrderCancellation,
  OrderCreation,
  OrderPostError,
  OrderQuoteRequest,
  TransactionHash,
  UID,
} from '../swagger/orderBookApi'
import { CowError } from '../utils/common'
import { SupportedChainId } from '../constants/chains'
import { EnvConfig, PROD_CONFIG, STAGING_CONFIG } from '../configs'
import { transformOrder } from './transformOrder'
import { EnrichedOrder } from './types'
import { ApiRequestOptions } from '../swagger/orderBookApi/core/ApiRequestOptions'
import { request as __request } from '../swagger/orderBookApi/core/request'

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
  private envConfig: EnvConfig
  private service: DefaultService

  constructor(chainId: SupportedChainId, env: 'prod' | 'staging' = 'prod') {
    this.envConfig = (env === 'prod' ? PROD_CONFIG : STAGING_CONFIG)[chainId]

    this.service = new OrderBookClient({ BASE: this.envConfig.apiUrl }, FetchHttpRequest).default
  }

  getTrades({ owner, orderId }: { owner?: Address; orderId?: UID }): ReturnType<typeof this.service.getApiV1Trades> {
    if (owner && orderId) {
      return new CancelablePromise((resolve, reject) => {
        reject(new CowError('Cannot specify both owner and orderId'))
      })
    }

    return this.service.getApiV1Trades(owner, orderId)
  }

  getOrders({
    owner,
    offset = 0,
    limit = 1000,
  }: {
    owner: Address
    offset?: number
    limit?: number
  }): Promise<Array<EnrichedOrder>> {
    return this.service.getApiV1AccountOrders(owner, offset, limit).then((orders) => {
      return orders.map(transformOrder)
    })
  }

  getTxOrders(txHash: TransactionHash): Promise<Array<EnrichedOrder>> {
    return this.service.getApiV1TransactionsOrders(txHash).then((orders) => {
      return orders.map(transformOrder)
    })
  }

  getOrder(uid: UID): Promise<EnrichedOrder> {
    return this.service.getApiV1Orders(uid).then((order) => {
      return transformOrder(order)
    })
  }

  getQuote(requestBody: OrderQuoteRequest): ReturnType<typeof this.service.postApiV1Quote> {
    return this.service.postApiV1Quote(requestBody)
  }

  sendSignedOrderCancellation(
    uid: UID,
    requestBody: OrderCancellation
  ): ReturnType<typeof this.service.deleteApiV1Orders1> {
    return this.service.deleteApiV1Orders1(uid, requestBody)
  }

  sendOrder(requestBody: OrderCreation): Promise<UID> {
    return this.service.postApiV1Orders(requestBody).catch((error) => {
      const body: OrderPostError = error.body

      if (body?.errorType) {
        throw new Error(body.errorType)
      }

      throw error
    })
  }

  getOrderLink(uid: UID): string {
    return this.envConfig.apiUrl + `/api/v1/orders/${uid}`
  }
}
