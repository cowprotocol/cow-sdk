"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBookApi = void 0;
const generated_1 = require("./generated");
const cow_error_1 = require("../common/cow-error");
const chains_1 = require("../common/chains");
const configs_1 = require("../common/configs");
const transformOrder_1 = require("./transformOrder");
const request_1 = require("./generated/core/request");
class FetchHttpRequest extends generated_1.BaseHttpRequest {
    constructor(config) {
        super(config);
    }
    /**
     * Request method
     * @param options The request options from the service
     * @returns CancelablePromise<T>
     * @throws ApiError
     */
    request(options) {
        return (0, request_1.request)(this.config, Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({}, options.headers), { 'Content-Type': 'application/json' }) }));
    }
}
class OrderBookApi {
    constructor(env = 'prod') {
        this.servicePerNetwork = {
            [chains_1.SupportedChainId.MAINNET]: null,
            [chains_1.SupportedChainId.GOERLI]: null,
            [chains_1.SupportedChainId.GNOSIS_CHAIN]: null,
        };
        this.envConfig = env === 'prod' ? configs_1.PROD_CONFIG : configs_1.STAGING_CONFIG;
    }
    getTrades(chainId, { owner, orderId }) {
        if (owner && orderId) {
            return new generated_1.CancelablePromise((_, reject) => {
                reject(new cow_error_1.CowError('Cannot specify both owner and orderId'));
            });
        }
        return this.getServiceForNetwork(chainId).getApiV1Trades(owner, orderId);
    }
    getOrders(chainId, { owner, offset = 0, limit = 1000, }) {
        return this.getServiceForNetwork(chainId)
            .getApiV1AccountOrders(owner, offset, limit)
            .then((orders) => {
            return orders.map(transformOrder_1.transformOrder);
        });
    }
    getTxOrders(chainId, txHash) {
        return this.getServiceForNetwork(chainId)
            .getApiV1TransactionsOrders(txHash)
            .then((orders) => {
            return orders.map(transformOrder_1.transformOrder);
        });
    }
    getOrder(chainId, uid) {
        return this.getServiceForNetwork(chainId)
            .getApiV1Orders(uid)
            .then((order) => {
            return (0, transformOrder_1.transformOrder)(order);
        });
    }
    getQuote(chainId, requestBody) {
        return this.getServiceForNetwork(chainId).postApiV1Quote(requestBody);
    }
    sendSignedOrderCancellation(chainId, uid, requestBody) {
        return this.getServiceForNetwork(chainId).deleteApiV1Orders1(uid, requestBody);
    }
    sendOrder(chainId, requestBody) {
        return this.getServiceForNetwork(chainId)
            .postApiV1Orders(requestBody)
            .catch((error) => {
            const body = error.body;
            if (body === null || body === void 0 ? void 0 : body.errorType) {
                throw new Error(body.errorType);
            }
            throw error;
        });
    }
    getNativePrice(chainId, tokenAddress) {
        return this.getServiceForNetwork(chainId).getApiV1TokenNativePrice(tokenAddress);
    }
    getOrderLink(chainId, uid) {
        return this.envConfig[chainId].apiUrl + `/api/v1/orders/${uid}`;
    }
    getServiceForNetwork(chainId) {
        const cached = this.servicePerNetwork[chainId];
        if (cached)
            return cached.default;
        const client = new generated_1.OrderBookClient({ BASE: this.envConfig[chainId].apiUrl }, FetchHttpRequest);
        this.servicePerNetwork[chainId] = client;
        return client.default;
    }
}
exports.OrderBookApi = OrderBookApi;
//# sourceMappingURL=api.js.map