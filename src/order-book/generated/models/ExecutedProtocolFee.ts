/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { FeePolicy } from './FeePolicy';
import type { TokenAmount } from './TokenAmount';

export type ExecutedProtocolFee = {
    policy?: FeePolicy;
    /**
     * Fee amount taken
     */
    amount?: TokenAmount;
    /**
     * The token in which the fee is taken
     */
    token?: Address;
};

