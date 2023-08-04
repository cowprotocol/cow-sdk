import { Order } from './generated'

/**
 * An order with the total fee added.
 */
export interface EnrichedOrder extends Order {
  totalFee: string
}
