/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PriceImprovement } from './PriceImprovement';
import type { Surplus } from './Surplus';
import type { Volume } from './Volume';

/**
 * Defines the ways to calculate the protocol fee.
 */
export type FeePolicy = (Surplus | Volume | PriceImprovement);

