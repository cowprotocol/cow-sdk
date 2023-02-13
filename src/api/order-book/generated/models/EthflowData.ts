/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TransactionHash } from './TransactionHash'

/**
 * Provides the additional data for ethflow orders
 *
 */
export type EthflowData = {
  /**
   * Specifies in which transaction the order was refunded. If
   * this field is null the order was not yet refunded.
   *
   */
  refundTxHash: TransactionHash | null
  /**
   * Describes the valid to of an order ethflow order.
   * Note that for ethflow orders, the valid_to encoded in the smart
   * contract is max(uint)
   *
   */
  userValidTo: number
  /**
   * Is ETH refunded
   *
   */
  isRefunded: boolean
}
