/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * How good should the price estimate be?
 *
 * **NOTE**: Orders are supposed to be created from `optimal` price estimates.
 *
 */
export enum PriceQuality {
    FAST = 'fast',
    OPTIMAL = 'optimal',
}
