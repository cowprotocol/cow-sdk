/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { AppDataHash } from './AppDataHash';
import type { BuyTokenDestination } from './BuyTokenDestination';
import type { OrderQuoteSide } from './OrderQuoteSide';
import type { OrderQuoteValidity } from './OrderQuoteValidity';
import type { PriceQuality } from './PriceQuality';
import type { SellTokenSource } from './SellTokenSource';
import type { SigningScheme } from './SigningScheme';

/**
 * Request fee and price quote.
 */
export type OrderQuoteRequest = (OrderQuoteSide & OrderQuoteValidity & {
    /**
     * ERC-20 token to be sold
     */
    sellToken: Address;
    /**
     * ERC-20 token to be bought
     */
    buyToken: Address;
    /**
     * An optional address to receive the proceeds of the trade instead of the
     * `owner` (i.e. the order signer).
     *
     */
    receiver?: Address | null;
    appData?: AppDataHash;
    /**
     * Is the order fill-or-kill or partially fillable?
     */
    partiallyFillable?: boolean;
    sellTokenBalance?: SellTokenSource;
    buyTokenBalance?: BuyTokenDestination;
    from: Address;
    priceQuality?: PriceQuality;
    signingScheme?: SigningScheme;
    /**
     * Flag to signal whether the order is intended for on-chain order placement. Only valid
     * for non ECDSA-signed orders."
     *
     */
    onchainOrder?: any;
});

