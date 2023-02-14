import { Address, CancelablePromise, OrderCancellation, OrderCreation, OrderQuoteRequest, OrderQuoteResponse, Trade, TransactionHash, UID } from './generated';
import { SupportedChainId } from '../common/chains';
import { EnrichedOrder } from './types';
export declare class OrderBookApi {
    private envConfig;
    private service;
    constructor(chainId: SupportedChainId, env?: 'prod' | 'staging');
    getTrades({ owner, orderId }: {
        owner?: Address;
        orderId?: UID;
    }): CancelablePromise<Array<Trade>>;
    getOrders({ owner, offset, limit, }: {
        owner: Address;
        offset?: number;
        limit?: number;
    }): Promise<Array<EnrichedOrder>>;
    getTxOrders(txHash: TransactionHash): Promise<Array<EnrichedOrder>>;
    getOrder(uid: UID): Promise<EnrichedOrder>;
    getQuote(requestBody: OrderQuoteRequest): CancelablePromise<OrderQuoteResponse>;
    sendSignedOrderCancellation(uid: UID, requestBody: OrderCancellation): CancelablePromise<void>;
    sendOrder(requestBody: OrderCreation): Promise<UID>;
    getOrderLink(uid: UID): string;
}
