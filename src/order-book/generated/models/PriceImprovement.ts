/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The protocol fee is taken as a percent of the order price improvement which is a difference between the executed price and the best quote.
 */
export type PriceImprovement = {
    factor: number;
    maxVolumeFactor: number;
};

