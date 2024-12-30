/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { AppDataHash } from './AppDataHash';
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
     * ERC-20 token to be sold.
     */
    sellToken: Address;
    /**
     * ERC-20 token to be bought.
     */
    buyToken: Address;
    /**
     * An optional Ethereum address to receive the proceeds of the trade instead of the owner (i.e. the order signer).
     *
     */
    receiver?: Address | null;
    /**
     * Amount of `sellToken` to be sold in atoms.
     */
    sellAmount: TokenAmount;
    /**
     * Amount of `buyToken` to be bought in atoms.
     */
    buyAmount: TokenAmount;
    /**
     * Unix timestamp (`uint32`) until which the order is valid.
     */
    validTo: number;
    appData: AppDataHash;
    /**
     * feeRatio * sellAmount + minimal_fee in atoms.
     */
    feeAmount: TokenAmount;
    /**
     * The kind is either a buy or sell order.
     */
    kind: OrderKind;
    /**
     * Is the order fill-or-kill or partially fillable?
     */
    partiallyFillable: boolean;
    sellTokenBalance?: SellTokenSource;
    buyTokenBalance?: BuyTokenDestination;
    signingScheme?: SigningScheme;
};

