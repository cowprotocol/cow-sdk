/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { AppData } from './AppData';
import type { AppDataHash } from './AppDataHash';
import type { BuyTokenDestination } from './BuyTokenDestination';
import type { OrderKind } from './OrderKind';
import type { SellTokenSource } from './SellTokenSource';
import type { Signature } from './Signature';
import type { SigningScheme } from './SigningScheme';
import type { TokenAmount } from './TokenAmount';

/**
 * Data a user provides when creating a new order.
 */
export type OrderCreation = {
    /**
     * see `OrderParameters::sellToken`
     */
    sellToken: Address;
    /**
     * see `OrderParameters::buyToken`
     */
    buyToken: Address;
    /**
     * see `OrderParameters::receiver`
     */
    receiver?: Address | null;
    /**
     * see `OrderParameters::sellAmount`
     */
    sellAmount: TokenAmount;
    /**
     * see `OrderParameters::buyAmount`
     */
    buyAmount: TokenAmount;
    /**
     * see `OrderParameters::validTo`
     */
    validTo: number;
    /**
     * see `OrderParameters::feeAmount`
     */
    feeAmount: TokenAmount;
    /**
     * see `OrderParameters::kind`
     */
    kind: OrderKind;
    /**
     * see `OrderParameters::partiallyFillable`
     */
    partiallyFillable: boolean;
    /**
     * see `OrderParameters::sellTokenBalance`
     */
    sellTokenBalance?: SellTokenSource;
    /**
     * see `OrderParameters::buyTokenBalance`
     */
    buyTokenBalance?: BuyTokenDestination;
    signingScheme: SigningScheme;
    signature: Signature;
    /**
     * If set, the backend enforces that this address matches what is decoded as the *signer* of the signature. This helps catch errors with invalid signature encodings as the backend might otherwise silently work with an unexpected address that for example does not have any balance.
     *
     */
    from?: Address | null;
    /**
     * Orders can optionally include a quote ID. This way the order can be linked to a quote and enable providing more metadata when analysing order slippage.
     *
     */
    quoteId?: number | null;
    /**
     * This field comes in two forms for backward compatibility. The hash form will eventually stop being accepted.
     *
     */
    appData: (AppData | AppDataHash);
    /**
     * May be set for debugging purposes. If set, this field is compared to what the backend internally calculates as the app data hash based on the contents of `appData`. If the hash does not match, an error is returned. If this field is set, then `appData` **MUST** be a string encoding of a JSON object.
     *
     */
    appDataHash?: AppDataHash | null;
};

