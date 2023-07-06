/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EcdsaSignature } from './EcdsaSignature';
import type { EcdsaSigningScheme } from './EcdsaSigningScheme';

/**
 * [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signature of struct
 * OrderCancellation { orderUid: bytes } from the order's owner.
 *
 */
export type OrderCancellation = {
    /**
     * OrderCancellation signed by owner
     */
    signature: EcdsaSignature;
    signingScheme: EcdsaSigningScheme;
};

