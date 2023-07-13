/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EcdsaSignature } from './EcdsaSignature';
import type { EcdsaSigningScheme } from './EcdsaSigningScheme';
import type { UID } from './UID';

/**
 * EIP-712 signature of struct OrderCancellations { orderUid: bytes[] } from the order's owner.
 *
 */
export type OrderCancellations = {
    /**
     * UIDs of orders to cancel.
     */
    orderUids?: Array<UID>;
    /**
     * `OrderCancellation` signed by the owner.
     */
    signature: EcdsaSignature;
    signingScheme: EcdsaSigningScheme;
};

