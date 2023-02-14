"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBookApi = void 0;
const generated_1 = require("./generated");
const cow_error_1 = require("../common/cow-error");
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
    constructor(chainId, env = 'prod') {
        this.envConfig = (env === 'prod' ? configs_1.PROD_CONFIG : configs_1.STAGING_CONFIG)[chainId];
        this.service = new generated_1.OrderBookClient({ BASE: this.envConfig.apiUrl }, FetchHttpRequest).default;
    }
    getTrades({ owner, orderId }) {
        if (owner && orderId) {
            return new generated_1.CancelablePromise((_, reject) => {
                reject(new cow_error_1.CowError('Cannot specify both owner and orderId'));
            });
        }
        return this.service.getApiV1Trades(owner, orderId);
    }
    getOrders({ owner, offset = 0, limit = 1000, }) {
        return this.service.getApiV1AccountOrders(owner, offset, limit).then((orders) => {
            return orders.map(transformOrder_1.transformOrder);
        });
    }
    getTxOrders(txHash) {
        return this.service.getApiV1TransactionsOrders(txHash).then((orders) => {
            return orders.map(transformOrder_1.transformOrder);
        });
    }
    getOrder(uid) {
        return this.service.getApiV1Orders(uid).then((order) => {
            return (0, transformOrder_1.transformOrder)(order);
        });
    }
    getQuote(requestBody) {
        return this.service.postApiV1Quote(requestBody);
    }
    sendSignedOrderCancellation(uid, requestBody) {
        return this.service.deleteApiV1Orders1(uid, requestBody);
    }
    sendOrder(requestBody) {
        return this.service.postApiV1Orders(requestBody).catch((error) => {
            const body = error.body;
            if (body === null || body === void 0 ? void 0 : body.errorType) {
                throw new Error(body.errorType);
            }
            throw error;
        });
    }
    getOrderLink(uid) {
        return this.envConfig.apiUrl + `/api/v1/orders/${uid}`;
    }
}
exports.OrderBookApi = OrderBookApi;
//# sourceMappingURL=api.js.map