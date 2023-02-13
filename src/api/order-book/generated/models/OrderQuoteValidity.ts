/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The validity for the order
 */
export type OrderQuoteValidity =
  | {
      /**
       * Unix timestamp until the order is valid. uint32.
       */
      validTo?: number
    }
  | {
      /**
       * Number of seconds that the order should be valid for. uint32.
       */
      validFor?: number
    }
