import { Order } from './generated'

export interface EnrichedOrder extends Order {
  totalFee: string
}
