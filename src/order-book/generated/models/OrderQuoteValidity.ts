/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The validity for the order.
 */
export type OrderQuoteValidity = ({
    /**
     * Unix timestamp (`uint32`) until which the order is valid.
     */
    validTo?: number;
} | {
    /**
     * Number (`uint32`) of seconds that the order should be valid for.
     */
    validFor?: number;
});

