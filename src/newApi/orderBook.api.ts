import { Address, DefaultService, OrderBookClient, UID } from '../swagger/orderBookApi'
import { CowError } from '../utils/common'
import { SupportedChainId } from '../constants/chains'
import { PROD_CONFIG, STAGING_CONFIG } from './configs'
import { transformOrder } from '../api/cow/transformOrder'

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

  getOrders(owner: Address, offset = 0, limit = 1000) {
    this.service.getApiV1AccountOrders(owner, offset, limit).then((orders) => {
      return orders.map(transformOrder)
    })
  }
}
