/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address'
import type { OrderParameters } from './OrderParameters'
import type { Signature } from './Signature'
import type { SigningScheme } from './SigningScheme'

/**
 * Data a user provides when creating a new order.
 */
export type OrderCreation = OrderParameters & {
  signingScheme: SigningScheme
  signature: Signature
  /**
   * If set, the backend enforces that this address matches what is decoded as the signer of
   * the signature. This helps catch errors with invalid signature encodings as the backend
   * might otherwise silently work with an unexpected address that for example does not have
   * any balance.
   *
   */
  from?: Address | null
  /**
   * Orders can optionally include a quote ID. This way the order can be linked to a quote
   * and enable providing more metadata when analyzing order slippage.
   *
   */
  quoteId?: number | null
}
