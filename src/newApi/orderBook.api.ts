import {
  Address,
  DefaultService,
  OrderBookClient,
  OrderCancellation,
  OrderCreation,
  OrderQuoteRequest,
  TransactionHash,
  UID,
} from '../swagger/orderBookApi'
import { CowError } from '../utils/common'
import { SupportedChainId } from '../constants/chains'
import { PROD_CONFIG, STAGING_CONFIG } from './configs'
import { transformOrder } from './transformOrder'
import { EnrichedOrder } from './types'

export class OrderBookApi {
  private service: DefaultService

  constructor(chainId: SupportedChainId, env: 'prod' | 'staging' = 'prod') {
    const config = (env === 'prod' ? PROD_CONFIG : STAGING_CONFIG)[chainId]

    this.service = new OrderBookClient({
      BASE: config.apiUrl,
    }).default
  }

  getTrades({ owner, orderUid }: { owner?: Address; orderUid?: UID }): ReturnType<typeof this.service.getApiV1Trades> {
    if (owner && orderUid) {
      throw new CowError('Cannot specify both owner and orderId')
    }

    return this.service.getApiV1Trades(owner, orderUid)
  }

  getOrders(owner: Address, offset = 0, limit = 1000): Promise<Array<EnrichedOrder>> {
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

  sendOrder(requestBody: OrderCreation): ReturnType<typeof this.service.postApiV1Orders> {
    return this.service.postApiV1Orders(requestBody)
  }
}
