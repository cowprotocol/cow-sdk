import type { Address } from './Address';
import type { TokenAmount } from './TokenAmount';
/**
 * Provides the information about an estimated price.
 *
 */
export type AmountEstimate = {
    /**
     * The estimated amount
     */
    amount?: TokenAmount;
    /**
     * The token in which the amount is given
     */
    token?: Address;
};
