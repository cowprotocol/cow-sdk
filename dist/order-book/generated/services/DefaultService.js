"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultService = void 0;
class DefaultService {
    constructor(httpRequest) {
        this.httpRequest = httpRequest;
    }
    /**
     * Create a new order.
     * @param requestBody The order to create.
     * @returns UID Order has been accepted.
     * @throws ApiError
     */
    postApiV1Orders(requestBody) {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/v1/orders',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Error during order validation`,
                403: `Forbidden, your account is deny-listed`,
                429: `Too many order placements`,
                500: `Error adding an order`,
            },
        });
    }
    /**
     * Cancels multiple orders by marking them invalid with a timestamp.
     * This is a best effort cancellation, and might not prevent solvers from
     * settling the orders (if the order is part of an in-flight settlement
     * transaction for example). Authentication must be provided by an EIP-712
     * signature of an "OrderCacellations(bytes[] orderUids)" message.
     *
     * @param requestBody Signed OrderCancellations
     * @returns any Orders deleted
     * @throws ApiError
     */
    deleteApiV1Orders(requestBody) {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/v1/orders',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Malformed signature`,
                401: `Invalid signature`,
                404: `One or more orders were not found and no orders were cancelled.`,
            },
        });
    }
    /**
     * Get existing order from UID.
     * @param uid
     * @returns Order Order
     * @throws ApiError
     */
    getApiV1Orders(uid) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/orders/{UID}',
            path: {
                'UID': uid,
            },
            errors: {
                404: `Order was not found`,
            },
        });
    }
    /**
     * @deprecated
     * Cancels order by marking it invalid with a timestamp.
     * The successful deletion might not prevent solvers from settling the order.
     * Authentication must be provided by providing an EIP-712 signature of an
     * "OrderCacellation(bytes orderUids)" message.
     *
     * @param uid
     * @param requestBody Signed OrderCancellation
     * @returns any Order deleted
     * @throws ApiError
     */
    deleteApiV1Orders1(uid, requestBody) {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/v1/orders/{UID}',
            path: {
                'UID': uid,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Malformed signature`,
                401: `Invalid signature`,
                404: `Order was not found`,
            },
        });
    }
    /**
     * Cancels order and replaces it with a new one
     * Cancel an order by providing a replacement order where the app data field
     * is the EIP-712-struct-hash of a cancellation for the original order. This
     * allows an old order to be cancelled AND a new order to be created in an
     * atomic operation with a single signature. This may be useful for replacing
     * orders when on-chain prices move outside of the original order's limit price.
     *
     * @param uid
     * @param requestBody replacement order
     * @returns UID Previous order was cancelled and the new replacement order was created.
     * @throws ApiError
     */
    patchApiV1Orders(uid, requestBody) {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/v1/orders/{UID}',
            path: {
                'UID': uid,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Error cancelling and replacing new order with an old one.`,
                401: `Invalid replacement order. This can happen if the old and new orders have
                different signers, the new order's app data is not an encoded cancellation of
                the old order, or the new order is based on presign or EIP-1271 signatures.
                `,
                403: `Forbidden`,
                404: `Order was not found`,
            },
        });
    }
    /**
     * Get orders by settlement transaction hash.
     * @param txHash
     * @returns Order Order
     * @throws ApiError
     */
    getApiV1TransactionsOrders(txHash) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/transactions/{txHash}/orders',
            path: {
                'txHash': txHash,
            },
        });
    }
    /**
     * Get existing Trades.
     * Exactly one of owner or order_uid has to be set.
     *
     * @param owner
     * @param orderUid
     * @returns Trade all trades
     * @throws ApiError
     */
    getApiV1Trades(owner, orderUid) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/trades',
            query: {
                'owner': owner,
                'orderUid': orderUid,
            },
        });
    }
    /**
     * Gets the current batch auction.
     * The current batch auction that solvers should be solving right now. Includes the list of
     * solvable orders, the block on which the batch was created, as well as prices for all tokens
     * being traded (used for objective value computation).
     *
     * @returns Auction the auction
     * @throws ApiError
     */
    getApiV1Auction() {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/auction',
        });
    }
    /**
     * Get orders of one user paginated.
     * The orders are ordered by their creation date descending (newest orders first).
     * To enumerate all orders start with offset 0 and keep increasing the offset by the total
     * number of returned results. When a response contains less than the limit the last page has
     * been reached.
     *
     * @param owner
     * @param offset The pagination offset. Defaults to 0.
     *
     * @param limit The pagination limit. Defaults to 10. Maximum 1000. Minimum 1.
     *
     * @returns Order the orders
     * @throws ApiError
     */
    getApiV1AccountOrders(owner, offset, limit) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/account/{owner}/orders',
            path: {
                'owner': owner,
            },
            query: {
                'offset': offset,
                'limit': limit,
            },
            errors: {
                400: `Problem with parameters like limit being too large.`,
            },
        });
    }
    /**
     * Get native price for the given token.
     * Price is the exchange rate between the specified token and the network's native currency.
     * It represents the amount of native token atoms needed to buy 1 atom of the specified token.
     *
     * @param token
     * @returns NativePriceResponse the estimated native price
     * @throws ApiError
     */
    getApiV1TokenNativePrice(token) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/token/{token}/native_price',
            path: {
                'token': token,
            },
            errors: {
                400: `Error finding the price.`,
                404: `No liquidity was found`,
                500: `Unexpected error`,
            },
        });
    }
    /**
     * Quotes a price and fee for the specified order parameters.
     * This API endpoint accepts a partial order and computes the minimum fee and
     * a price estimate for the order. It returns a full order that can be used
     * directly for signing, and with an included signature, passed directly to
     * the order creation endpoint.
     *
     * @param requestBody The order parameters to compute a quote for.
     * @returns OrderQuoteResponse Quoted order.
     * @throws ApiError
     */
    postApiV1Quote(requestBody) {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/v1/quote',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Error quoting order.`,
                403: `Forbidden, your account is deny-listed`,
                429: `Too many order quotes`,
                500: `Unexpected error quoting an order`,
            },
        });
    }
    /**
     * Information about solver competition
     * Returns the competition information by auction id.
     *
     * @param auctionId
     * @returns SolverCompetitionResponse competition info
     * @throws ApiError
     */
    getApiV1SolverCompetition(auctionId) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/solver_competition/{auction_id}',
            path: {
                'auction_id': auctionId,
            },
            errors: {
                404: `No competition information available for this auction id.`,
            },
        });
    }
    /**
     * Information about solver competition
     * Returns the competition information by transaction hash.
     *
     * @param txHash
     * @returns SolverCompetitionResponse competition info
     * @throws ApiError
     */
    getApiV1SolverCompetitionByTxHash(txHash) {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/solver_competition/by_tx_hash/{tx_hash}',
            path: {
                'tx_hash': txHash,
            },
            errors: {
                404: `No competition information available for this tx hash.`,
            },
        });
    }
    /**
     * Information about the current deployed version of the API
     * Returns the git commit hash, branch name and release tag (code: https://github.com/cowprotocol/services).
     *
     * @returns VersionResponse version info
     * @throws ApiError
     */
    getApiV1Version() {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/version',
        });
    }
}
exports.DefaultService = DefaultService;
//# sourceMappingURL=DefaultService.js.map