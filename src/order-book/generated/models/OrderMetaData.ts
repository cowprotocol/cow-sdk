/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { BigUint } from './BigUint';
import type { EthflowData } from './EthflowData';
import type { OnchainOrderData } from './OnchainOrderData';
import type { OrderClass } from './OrderClass';
import type { OrderStatus } from './OrderStatus';
import type { TokenAmount } from './TokenAmount';
import type { UID } from './UID';

/**
 * Extra order data that is returned to users when querying orders
 * but not provided by users when creating orders.
 *
 */
export type OrderMetaData = {
    /**
     * Creation time of the order. Encoded as ISO 8601 UTC.
     */
    creationDate: string;
    class: OrderClass;
    owner: Address;
    uid: UID;
    /**
     * Unused field that is currently always set to null and will be removed in the future.
     * @deprecated
     */
    availableBalance?: TokenAmount | null;
    /**
     * The total amount of sellToken that has been executed for this order including fees.
     */
    executedSellAmount: BigUint;
    /**
     * The total amount of sellToken that has been executed for this order without fees.
     */
    executedSellAmountBeforeFees: BigUint;
    /**
     * The total amount of buyToken that has been executed for this order.
     */
    executedBuyAmount: BigUint;
    /**
     * The total amount of fees that have been executed for this order.
     */
    executedFeeAmount: BigUint;
    /**
     * Has this order been invalidated?
     */
    invalidated: boolean;
    /**
     * Order status
     */
    status: OrderStatus;
    /**
     * Amount that the signed fee would be without subsidies
     */
    fullFeeAmount?: TokenAmount;
    /**
     * Liquidity orders are functionally the same as normal smart contract orders but are not
     * placed with the intent of actively getting traded. Instead they facilitate the
     * trade of normal orders by allowing them to be matched against liquidity orders which
     * uses less gas and can have better prices than external liquidity.
     * As such liquidity orders will only be used in order to improve settlement of normal
     * orders. They should not be expected to be traded otherwise and should not expect to get
     * surplus.
     *
     */
    isLiquidityOrder?: boolean;
    /**
     * For ethflow orders - order that are placed onchain with native eth -, this field
     * contains a struct with two variables user_valid_to and is_refunded
     *
     */
    ethflowData?: EthflowData;
    /**
     * This represents the actual trader of an on-chain order.
     * In that case, the owner would be the EthFlow contract in the case of EthFlow orders and not the actual trader.
     *
     */
    onchainUser?: Address;
    /**
     * There is some data only available for orders that are placed onchain. This data
     * can be found in this object
     *
     */
    onchainOrderData?: OnchainOrderData;
    /**
     * Surplus fee that the limit order was executed with.
     */
    executedSurplusFee?: BigUint | null;
};

