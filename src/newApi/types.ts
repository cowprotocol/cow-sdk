import { Order } from '../swagger/orderBookApi'

export interface EnrichedOrder extends Order {
  totalFee: string
}
