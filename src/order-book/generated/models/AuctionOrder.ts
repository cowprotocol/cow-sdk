/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { AppDataHash } from './AppDataHash';
import type { BuyTokenDestination } from './BuyTokenDestination';
import type { FeePolicy } from './FeePolicy';
import type { InteractionData } from './InteractionData';
import type { OrderClass } from './OrderClass';
import type { OrderKind } from './OrderKind';
import type { Quote } from './Quote';
import type { SellTokenSource } from './SellTokenSource';
import type { Signature } from './Signature';
import type { TokenAmount } from './TokenAmount';
import type { UID } from './UID';

/**
 * A solvable order included in the current batch auction. Contains the data forwarded to solvers for solving.
 *
 */
export type AuctionOrder = {
    uid: UID;
    /**
     * see `OrderParameters::sellToken`
     */
    sellToken: Address;
    /**
     * see `OrderParameters::buyToken`
     */
    buyToken: Address;
    /**
     * see `OrderParameters::sellAmount`
     */
    sellAmount: TokenAmount;
    /**
     * see `OrderParameters::buyAmount`
     */
    buyAmount: TokenAmount;
    /**
     * Creation time of the order. Denominated in epoch seconds.
     */
    created: string;
    /**
     * see `OrderParameters::validTo`
     */
    validTo: number;
    /**
     * see `OrderParameters::kind`
     */
    kind: OrderKind;
    /**
     * see `OrderParameters::receiver`
     */
    receiver: Address | null;
    owner: Address;
    /**
     * see `OrderParameters::partiallyFillable`
     */
    partiallyFillable: boolean;
    /**
     * Currently executed amount of sell/buy token, depending on the order kind.
     *
     */
    executed: TokenAmount;
    /**
     * The pre-interactions that need to be executed before the first execution of the order.
     *
     */
    preInteractions: Array<InteractionData>;
    /**
     * The post-interactions that need to be executed after the execution of the order.
     *
     */
    postInteractions: Array<InteractionData>;
    /**
     * see `OrderParameters::sellTokenBalance`
     */
    sellTokenBalance: SellTokenSource;
    /**
     * see `OrderParameters::buyTokenBalance`
     */
    buyTokenBalance: BuyTokenDestination;
    class: OrderClass;
    appData: AppDataHash;
    signature: Signature;
    /**
     * The fee policies that are used to compute the protocol fees for this order.
     *
     */
    protocolFees: Array<FeePolicy>;
    /**
     * A winning quote.
     *
     */
    quote?: Quote;
};

