/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TokenAmount } from './TokenAmount'

/**
 * Provides the information to calculate the fees.
 *
 */
export type FeeInformation = {
  /**
   * Expiration date of the offered fee. Order service might not accept
   * the fee after this expiration date. Encoded as ISO 8601 UTC.
   *
   */
  expiration: string
  /**
   * Absolute amount of fee charged per order in specified sellToken
   */
  amount: TokenAmount
}
