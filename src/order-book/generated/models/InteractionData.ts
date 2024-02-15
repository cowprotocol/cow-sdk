/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { CallData } from './CallData';
import type { TokenAmount } from './TokenAmount';

export type InteractionData = {
    target?: Address;
    value?: TokenAmount;
    /**
     * The call data to be used for the interaction.
     */
    call_data?: Array<CallData>;
};

