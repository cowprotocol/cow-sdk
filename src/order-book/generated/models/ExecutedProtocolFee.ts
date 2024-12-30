/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { FeePolicy } from './FeePolicy';
import type { TokenAmount } from './TokenAmount';

export type ExecutedProtocolFee = {
    policy?: FeePolicy;
    amount?: TokenAmount;
    token?: Address;
};

