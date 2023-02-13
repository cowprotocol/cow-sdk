/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address'
import type { AppData } from './AppData'
import type { BuyTokenDestination } from './BuyTokenDestination'
import type { OrderQuoteSide } from './OrderQuoteSide'
import type { OrderQuoteValidity } from './OrderQuoteValidity'
import type { PriceQuality } from './PriceQuality'
import type { SellTokenSource } from './SellTokenSource'
import type { SigningScheme } from './SigningScheme'

/**
 * Request fee and price quote.
 */
export type OrderQuoteRequest = OrderQuoteSide &
  OrderQuoteValidity & {
    /**
     * ERC20 token to be sold
     */
    sellToken: Address
    /**
     * ERC20 token to be bought
     */
    buyToken: Address
    /**
     * An optional address to receive the proceeds of the trade instead of the
     * owner (i.e. the order signer).
     *
     */
    receiver?: Address | null
    /**
     * Arbitrary application specific data that can be added to an order. This can
     * also be used to ensure uniqueness between two orders with otherwise the
     * exact same parameters.
     *
     */
    appData?: AppData
    /**
     * Is this a fill-or-kill order or a partially fillable order?
     */
    partiallyFillable?: boolean
    sellTokenBalance?: SellTokenSource
    buyTokenBalance?: BuyTokenDestination
    from: Address
    priceQuality?: PriceQuality
    signingScheme?: SigningScheme
    /**
     * Flag to signal whether the order is intended for onchain order placement. Only valid for non ECDSA-signed orders
     */
    onchainOrder?: any
  }
