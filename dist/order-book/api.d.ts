import { Address, CancelablePromise, NativePriceResponse, OrderCancellation, OrderCreation, OrderQuoteRequest, OrderQuoteResponse, Trade, TransactionHash, UID } from './generated';
import { SupportedChainId } from '../common/chains';
import { EnrichedOrder } from './types';
export declare class OrderBookApi {
    private envConfig;
    private servicePerNetwork;
    constructor(env?: 'prod' | 'staging');
    getTrades(chainId: SupportedChainId, { owner, orderId }: {
        owner?: Address;
        orderId?: UID;
    }): CancelablePromise<Array<Trade>>;
    getOrders(chainId: SupportedChainId, { owner, offset, limit, }: {
        owner: Address;
        offset?: number;
        limit?: number;
    }): Promise<Array<EnrichedOrder>>;
    getTxOrders(chainId: SupportedChainId, txHash: TransactionHash): Promise<Array<EnrichedOrder>>;
    getOrder(chainId: SupportedChainId, uid: UID): Promise<EnrichedOrder>;
    getQuote(chainId: SupportedChainId, requestBody: OrderQuoteRequest): CancelablePromise<OrderQuoteResponse>;
    sendSignedOrderCancellation(chainId: SupportedChainId, uid: UID, requestBody: OrderCancellation): CancelablePromise<void>;
    sendOrder(chainId: SupportedChainId, requestBody: OrderCreation): Promise<UID>;
    getNativePrice(chainId: SupportedChainId, tokenAddress: Address): CancelablePromise<NativePriceResponse>;
    getOrderLink(chainId: SupportedChainId, uid: UID): string;
    private getServiceForNetwork;
}
