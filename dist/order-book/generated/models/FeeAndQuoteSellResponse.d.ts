import type { FeeInformation } from './FeeInformation';
import type { TokenAmount } from './TokenAmount';
export type FeeAndQuoteSellResponse = {
    fee?: FeeInformation;
    /**
     * The buy amount after deducting the fee.
     */
    buyAmountAfterFee?: TokenAmount;
};
