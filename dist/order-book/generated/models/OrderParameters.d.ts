import type { Address } from './Address';
import type { AppData } from './AppData';
import type { BuyTokenDestination } from './BuyTokenDestination';
import type { OrderKind } from './OrderKind';
import type { SellTokenSource } from './SellTokenSource';
import type { SigningScheme } from './SigningScheme';
import type { TokenAmount } from './TokenAmount';
/**
 * Order parameters.
 */
export type OrderParameters = {
    /**
     * ERC20 token to be sold
     */
    sellToken: Address;
    /**
     * ERC20 token to be bought
     */
    buyToken: Address;
    /**
     * An optional address to receive the proceeds of the trade instead of the
     * owner (i.e. the order signer).
     *
     */
    receiver?: Address | null;
    /**
     * Amount of sellToken to be sold in atoms
     */
    sellAmount: TokenAmount;
    /**
     * Amount of buyToken to be bought in atoms
     */
    buyAmount: TokenAmount;
    /**
     * Unix timestamp until the order is valid. uint32.
     */
    validTo: number;
    /**
     * Arbitrary application specific data that can be added to an order. This can
     * also be used to ensure uniqueness between two orders with otherwise the
     * exact same parameters.
     *
     */
    appData: AppData;
    /**
     * Fees: feeRatio * sellAmount + minimal_fee in atoms
     */
    feeAmount: TokenAmount;
    /**
     * The kind is either a buy or sell order
     */
    kind: OrderKind;
    /**
     * Is this a fill-or-kill order or a partially fillable order?
     */
    partiallyFillable: boolean;
    sellTokenBalance?: SellTokenSource;
    buyTokenBalance?: BuyTokenDestination;
    signingScheme?: SigningScheme;
};
