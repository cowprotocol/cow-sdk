/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { AppData } from './AppData';
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
    /**
     * AppData which will be assigned to the order.
     *
     * Expects either a string JSON doc as defined on
     * [AppData](https://github.com/cowprotocol/app-data) or a hex
     * encoded string for backwards compatibility.
     *
     * When the first format is used, it's possible to provide the
     * derived appDataHash field.
     */
    appData?: (AppData | AppDataHash);
    /**
     * The hash of the stringified JSON appData doc.
     *
     * If present, `appData` field must be set with the aforementioned
     * data where this hash is derived from.
     *
     * In case they differ, the call will fail.
     */
    appDataHash?: AppDataHash;
    sellTokenBalance?: SellTokenSource;
    buyTokenBalance?: BuyTokenDestination;
    from: Address;
    priceQuality?: PriceQuality;
    signingScheme?: SigningScheme;
    /**
     * Flag to signal whether the order is intended for on-chain order placement. Only valid for non ECDSA-signed orders."
     *
     */
    onchainOrder?: any;
});

