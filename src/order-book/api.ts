import {
  Address,
  BaseHttpRequest,
  CancelablePromise,
  DefaultService,
  NativePriceResponse,
  OpenAPIConfig,
  OrderBookClient,
  OrderCancellation,
  OrderCreation,
  OrderPostError,
  OrderQuoteRequest,
  OrderQuoteResponse,
  Trade,
  TransactionHash,
  UID,
} from './generated'
import { CowError } from '../common/cow-error'
import { SupportedChainId } from '../common/chains'
import { EnvConfigs, PROD_CONFIG, STAGING_CONFIG } from '../common/configs'
import { transformOrder } from './transformOrder'
import { EnrichedOrder } from './types'
import { ApiRequestOptions } from './generated/core/ApiRequestOptions'
import { request as __request } from './generated/core/request'

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
  private envConfig: EnvConfigs
  private servicePerNetwork: Record<SupportedChainId, OrderBookClient | null> = {
    [SupportedChainId.MAINNET]: null,
    [SupportedChainId.GOERLI]: null,
    [SupportedChainId.GNOSIS_CHAIN]: null,
  }

  constructor(env: 'prod' | 'staging' = 'prod') {
    this.envConfig = env === 'prod' ? PROD_CONFIG : STAGING_CONFIG
  }

  getTrades(
    chainId: SupportedChainId,
    { owner, orderId }: { owner?: Address; orderId?: UID }
  ): CancelablePromise<Array<Trade>> {
    if (owner && orderId) {
      return new CancelablePromise((_, reject) => {
        reject(new CowError('Cannot specify both owner and orderId'))
      })
    }

    return this.getServiceForNetwork(chainId).getApiV1Trades(owner, orderId)
  }

  getOrders(
    chainId: SupportedChainId,
    {
      owner,
      offset = 0,
      limit = 1000,
    }: {
      owner: Address
      offset?: number
      limit?: number
    }
  ): Promise<Array<EnrichedOrder>> {
    return this.getServiceForNetwork(chainId)
      .getApiV1AccountOrders(owner, offset, limit)
      .then((orders) => {
        return orders.map(transformOrder)
      })
  }

  getTxOrders(chainId: SupportedChainId, txHash: TransactionHash): Promise<Array<EnrichedOrder>> {
    return this.getServiceForNetwork(chainId)
      .getApiV1TransactionsOrders(txHash)
      .then((orders) => {
        return orders.map(transformOrder)
      })
  }

  getOrder(chainId: SupportedChainId, uid: UID): Promise<EnrichedOrder> {
    return this.getServiceForNetwork(chainId)
      .getApiV1Orders(uid)
      .then((order) => {
        return transformOrder(order)
      })
  }

  getQuote(chainId: SupportedChainId, requestBody: OrderQuoteRequest): CancelablePromise<OrderQuoteResponse> {
    return this.getServiceForNetwork(chainId).postApiV1Quote(requestBody)
  }

  sendSignedOrderCancellation(
    chainId: SupportedChainId,
    uid: UID,
    requestBody: OrderCancellation
  ): CancelablePromise<void> {
    return this.getServiceForNetwork(chainId).deleteApiV1Orders1(uid, requestBody)
  }

  sendOrder(chainId: SupportedChainId, requestBody: OrderCreation): Promise<UID> {
    return this.getServiceForNetwork(chainId)
      .postApiV1Orders(requestBody)
      .catch((error) => {
        const body: OrderPostError = error.body

        if (body?.errorType) {
          throw new Error(body.errorType)
        }

        throw error
      })
  }

  getNativePrice(chainId: SupportedChainId, tokenAddress: Address): CancelablePromise<NativePriceResponse> {
    return this.getServiceForNetwork(chainId).getApiV1TokenNativePrice(tokenAddress)
  }

  getOrderLink(chainId: SupportedChainId, uid: UID): string {
    return this.envConfig[chainId].apiUrl + `/api/v1/orders/${uid}`
  }

  private getServiceForNetwork(chainId: SupportedChainId): DefaultService {
    const cached = this.servicePerNetwork[chainId]

    if (cached) return cached.default

    const client = new OrderBookClient({ BASE: this.envConfig[chainId].apiUrl }, FetchHttpRequest)
    this.servicePerNetwork[chainId] = client

    return client.default
  }
}