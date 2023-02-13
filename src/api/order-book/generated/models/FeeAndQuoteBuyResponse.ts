/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FeeInformation } from './FeeInformation'
import type { TokenAmount } from './TokenAmount'

export type FeeAndQuoteBuyResponse = {
  fee?: FeeInformation
  /**
   * The sell amount including the fee.
   */
  sellAmountBeforeFee?: TokenAmount
}
