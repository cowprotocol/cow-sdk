"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jest_fetch_mock_1 = tslib_1.__importStar(require("jest-fetch-mock"));
const contracts_1 = require("@cowprotocol/contracts");
const cow_error_1 = require("../common/cow-error");
const api_1 = require("./api");
const generated_1 = require("./generated");
(0, jest_fetch_mock_1.enableFetchMocks)();
const chainId = 100; // Gnosis chain
const orderBookApi = new api_1.OrderBookApi();
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;
const HEADERS = { 'Content-Type': 'application/json' };
const SIGNED_ORDER_RESPONSE = {
    signature: '0x4d306ce7c770d22005bcfc00223f8d9aaa04e8a20099cc986cb9ccf60c7e876b777ceafb1e03f359ebc6d3dc84245d111a3df584212b5679cb5f9e6717b69b031b',
    signingScheme: generated_1.EcdsaSigningScheme.EIP712,
};
const PARTIAL_ORDER = {
    sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    sellAmount: '1234567890',
    buyAmount: '1234567890',
    validTo: 0,
    appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
    partiallyFillable: true,
    sellTokenBalance: generated_1.SellTokenSource.ERC20,
    buyTokenBalance: generated_1.BuyTokenDestination.ERC20,
    from: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    kind: generated_1.OrderKind.BUY,
    class: 'market',
};
const ORDER_RESPONSE = Object.assign(Object.assign(Object.assign(Object.assign({}, PARTIAL_ORDER), { feeAmount: '1234567890' }), SIGNED_ORDER_RESPONSE), { creationTime: '2020-12-03T18:35:18.814523Z', owner: '0x6810e776880c02933d47db1b9fc05908e5386b96', uid: '0x59920c85de0162e9e55df8d396e75f3b6b7c2dfdb535f03e5c807731c31585eaff714b8b0e2700303ec912bd40496c3997ceea2b616d6710', availableBalance: '1234567890', executedSellAmount: '1234567890', executedSellAmountBeforeFees: '1234567890', executedBuyAmount: '1234567890', executedFeeAmount: '1234567890', invalidated: true, status: 'presignaturePending', fullFeeAmount: '1234567890' });
const ETH_FLOW_ORDER_RESPONSE = Object.assign(Object.assign({}, ORDER_RESPONSE), { owner: '0x76aaf674848311c7f21fc691b0b952f016da49f3', ethflowData: {
        isRefunded: false,
        validTo: Date.now() + 60 * 1000 * 5,
    }, onchainUser: '0x6810e776880c02933d47db1b9fc05908e5386b96' });
const ORDER_CANCELLATION_UID = '0x59920c85de0162e9e55df8d396e75f3b6b7c2dfdb535f03e5c807731c31585eaff714b8b0e2700303ec912bd40496c3997ceea2b616d6710';
const TRADE_RESPONSE = {
    blockNumber: 0,
    logIndex: 0,
    orderUid: 'string',
    owner: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    sellAmount: '1234567890',
    sellAmountBeforeFees: '1234567890',
    buyAmount: '1234567890',
    transactionHash: '0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5',
};
const RAW_FETCH_RESPONSE_PARAMETERS = {
    body: undefined,
    headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
    }),
    method: 'GET',
    signal: expect.anything(),
};
const FETCH_RESPONSE_PARAMETERS = expect.objectContaining(RAW_FETCH_RESPONSE_PARAMETERS);
describe('Cow Api', () => {
    beforeEach(() => {
        jest_fetch_mock_1.default.resetMocks();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    test('Valid: Get orders link', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const orderLink = yield orderBookApi.getOrderLink(chainId, ORDER_RESPONSE.uid);
        expect(orderLink).toEqual(`https://api.cow.fi/xdai/api/v1/orders/${ORDER_RESPONSE.uid}`);
    }));
    test('Valid: Get an order', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify(ORDER_RESPONSE), {
            status: HTTP_STATUS_OK,
            headers: HEADERS,
        });
        // when
        const order = yield orderBookApi.getOrder(chainId, ORDER_RESPONSE.uid);
        // then
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(`https://api.cow.fi/xdai/api/v1/orders/${ORDER_RESPONSE.uid}`, FETCH_RESPONSE_PARAMETERS);
        expect(order === null || order === void 0 ? void 0 : order.uid).toEqual(ORDER_RESPONSE.uid);
    }));
    test('Invalid: Get an order', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        jest_fetch_mock_1.default.mockResponse(JSON.stringify({
            errorType: 'NotFound',
            description: "You've passed an invalid URL",
        }), { status: HTTP_STATUS_NOT_FOUND, headers: HEADERS });
        // when
        const promise = orderBookApi.getOrder(chainId, 'notValidOrderId');
        // then
        yield expect(promise).rejects.toThrow('Order was not found');
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith('https://api.cow.fi/xdai/api/v1/orders/notValidOrderId', FETCH_RESPONSE_PARAMETERS);
    }));
    test('Valid: Get last 5 orders for a given trader ', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const ORDERS_RESPONSE = Array(5).fill(ORDER_RESPONSE);
        jest_fetch_mock_1.default.mockResponse(JSON.stringify(ORDERS_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS });
        const orders = yield orderBookApi.getOrders(chainId, {
            owner: '0x00000000005ef87f8ca7014309ece7260bbcdaeb',
            limit: 5,
            offset: 0,
        });
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith('https://api.cow.fi/xdai/api/v1/account/0x00000000005ef87f8ca7014309ece7260bbcdaeb/orders?offset=0&limit=5', FETCH_RESPONSE_PARAMETERS);
        expect(orders.length).toEqual(5);
    }));
    test('Invalid: Get last 5 orders for an unexisting trader ', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        jest_fetch_mock_1.default.mockResponse(JSON.stringify({
            errorType: 'NotFound',
            description: "You've passed an invalid URL",
        }), { status: HTTP_STATUS_NOT_FOUND, headers: HEADERS });
        // when
        const promise = orderBookApi.getOrders(chainId, {
            owner: 'invalidOwner',
            limit: 5,
            offset: 0,
        });
        // then
        yield expect(promise).rejects.toThrow('Not Found');
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith('https://api.cow.fi/xdai/api/v1/account/invalidOwner/orders?offset=0&limit=5', FETCH_RESPONSE_PARAMETERS);
    }));
    test('Valid: Get tx orders from a given txHash', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const ORDERS_RESPONSE = Array(5).fill(ORDER_RESPONSE);
        const txHash = '0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5';
        jest_fetch_mock_1.default.mockResponse(JSON.stringify(ORDERS_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS });
        const txOrders = yield orderBookApi.getTxOrders(chainId, txHash);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(`https://api.cow.fi/xdai/api/v1/transactions/${txHash}/orders`, FETCH_RESPONSE_PARAMETERS);
        expect(txOrders.length).toEqual(5);
    }));
    test('Invalid: Get tx orders from an unexisting txHash', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        jest_fetch_mock_1.default.mockResponse(JSON.stringify({
            errorType: 'NotFound',
            description: "You've passed an invalid URL",
        }), { status: HTTP_STATUS_NOT_FOUND, headers: HEADERS });
        // when
        const promise = orderBookApi.getTxOrders(chainId, 'invalidTxHash');
        // then
        yield expect(promise).rejects.toThrow('Not Found');
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith('https://api.cow.fi/xdai/api/v1/transactions/invalidTxHash/orders', FETCH_RESPONSE_PARAMETERS);
    }));
    test('Valid: Get last 5 trades for a given trader ', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const TRADES_RESPONSE = Array(5).fill(TRADE_RESPONSE);
        jest_fetch_mock_1.default.mockResponse(JSON.stringify(TRADES_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS });
        const trades = yield orderBookApi.getTrades(chainId, {
            owner: TRADE_RESPONSE.owner, // Trader
        });
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(`https://api.cow.fi/xdai/api/v1/trades?owner=${TRADE_RESPONSE.owner}`, FETCH_RESPONSE_PARAMETERS);
        expect(trades.length).toEqual(5);
    }));
    test('Valid: Get last 5 trades for a given order id ', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const TRADES_RESPONSE = Array(5).fill(TRADE_RESPONSE);
        jest_fetch_mock_1.default.mockResponse(JSON.stringify(TRADES_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS });
        const trades = yield orderBookApi.getTrades(chainId, {
            orderId: TRADE_RESPONSE.orderUid,
        });
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(`https://api.cow.fi/xdai/api/v1/trades?orderUid=${TRADE_RESPONSE.orderUid}`, FETCH_RESPONSE_PARAMETERS);
        expect(trades.length).toEqual(5);
    }));
    test('Invalid: Get trades passing both the owner and orderId', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        expect(orderBookApi.getTrades(chainId, {
            owner: TRADE_RESPONSE.owner,
            orderId: TRADE_RESPONSE.orderUid,
        })).rejects.toThrowError(cow_error_1.CowError);
    }));
    test('Invalid: Get last 5 trades for an unexisting trader ', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        jest_fetch_mock_1.default.mockResponse(JSON.stringify({
            errorType: 'NotFound',
            description: "You've passed an invalid URL",
        }), { status: HTTP_STATUS_NOT_FOUND, headers: HEADERS });
        // when
        const promise = orderBookApi.getTrades(chainId, {
            owner: 'invalidOwner',
        });
        // then
        yield expect(promise).rejects.toThrow('Not Found');
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith('https://api.cow.fi/xdai/api/v1/trades?owner=invalidOwner', FETCH_RESPONSE_PARAMETERS);
    }));
    // TODO: move to another class - walletSDK or something similar
    // test('Valid: Sign Order', async () => {
    //   const order: Omit<UnsignedOrder, 'appData'> = {
    //     kind: OrderKind.SELL,
    //     partiallyFillable: false, // Allow partial executions of an order (true would be for a "Fill or Kill" order, which is not yet supported but will be added soon)
    //     sellToken: '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
    //     buyToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b', // USDC
    //     sellAmount: '1234567890',
    //     buyAmount: '1234567890',
    //     validTo: 2524608000,
    //     receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    //     feeAmount: '1234567890',
    //   }
    //
    //   const signedOrder = await cowSdk.signOrder(order)
    //   expect(signedOrder.signature).not.toBeNull()
    //   expect(signedOrder.signingScheme).not.toBeNull()
    // })
    test('Valid: Send sign order cancellation', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify(SIGNED_ORDER_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS });
        yield orderBookApi.sendSignedOrderCancellation(chainId, ORDER_CANCELLATION_UID, SIGNED_ORDER_RESPONSE);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(`https://api.cow.fi/xdai/api/v1/orders/${ORDER_CANCELLATION_UID}`, expect.objectContaining(Object.assign(Object.assign({}, RAW_FETCH_RESPONSE_PARAMETERS), { body: JSON.stringify(SIGNED_ORDER_RESPONSE), method: 'DELETE' })));
    }));
    test('Invalid: Send sign not found order cancellation', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        jest_fetch_mock_1.default.mockResponse(JSON.stringify({
            errorType: 'NotFound',
            description: "You've passed an invalid URL",
        }), { status: HTTP_STATUS_NOT_FOUND, headers: HEADERS });
        // when
        const promise = orderBookApi.sendSignedOrderCancellation(chainId, 'unexistingOrder', SIGNED_ORDER_RESPONSE);
        // then
        yield expect(promise).rejects.toThrow('Order was not found');
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith('https://api.cow.fi/xdai/api/v1/orders/unexistingOrder', expect.objectContaining(Object.assign(Object.assign({}, RAW_FETCH_RESPONSE_PARAMETERS), { body: JSON.stringify(SIGNED_ORDER_RESPONSE), method: 'DELETE' })));
    }));
    // TODO move to another class - walletSDK or something similar
    // test('Valid: Sign cancellation Order', async () => {
    //   const signCancellationOrder = await cowSdk.signOrderCancellation(ORDER_RESPONSE.uid)
    //   expect(signCancellationOrder.signature).not.toBeNull()
    //   expect(signCancellationOrder.signingScheme).not.toBeNull()
    // })
    test('Valid: Send an order ', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify('validOrderId'), { status: HTTP_STATUS_OK, headers: HEADERS });
        const orderId = yield orderBookApi.sendOrder(chainId, Object.assign(Object.assign(Object.assign({}, ORDER_RESPONSE), SIGNED_ORDER_RESPONSE), { signingScheme: generated_1.SigningScheme.EIP712, from: '0x1811be0994930fe9480eaede25165608b093ad7a' }));
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith('https://api.cow.fi/xdai/api/v1/orders', expect.objectContaining(Object.assign(Object.assign({}, RAW_FETCH_RESPONSE_PARAMETERS), { body: JSON.stringify(Object.assign(Object.assign(Object.assign({}, ORDER_RESPONSE), SIGNED_ORDER_RESPONSE), { from: '0x1811be0994930fe9480eaede25165608b093ad7a', signingScheme: 'eip712' })), method: 'POST' })));
        expect(orderId).toEqual('validOrderId');
    }));
    test('Invalid: Send an duplicate order ', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        jest_fetch_mock_1.default.mockResponse(JSON.stringify({
            errorType: 'DuplicateOrder',
            description: 'order already exists',
        }), { status: 400, headers: HEADERS });
        // when
        const promise = orderBookApi.sendOrder(chainId, Object.assign(Object.assign(Object.assign({}, ORDER_RESPONSE), SIGNED_ORDER_RESPONSE), { signingScheme: generated_1.SigningScheme.EIP712, from: '0x1811be0994930fe9480eaede25165608b093ad7a' }));
        // then
        yield expect(promise).rejects.toThrow('DuplicateOrder');
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith('https://api.cow.fi/xdai/api/v1/orders', expect.objectContaining(Object.assign(Object.assign({}, RAW_FETCH_RESPONSE_PARAMETERS), { body: JSON.stringify(Object.assign(Object.assign(Object.assign({}, ORDER_RESPONSE), SIGNED_ORDER_RESPONSE), { from: '0x1811be0994930fe9480eaede25165608b093ad7a', signingScheme: 'eip712' })), method: 'POST' })));
    }));
    test('Valid: Get last 5 orders changing options parameters', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const ORDERS_RESPONSE = Array(5).fill(ORDER_RESPONSE);
        jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify(ORDERS_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS });
        const orders = yield orderBookApi.getOrders(chainId, {
            owner: '0x00000000005ef87f8ca7014309ece7260bbcdaeb',
            limit: 5,
            offset: 0,
        });
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith('https://api.cow.fi/xdai/api/v1/account/0x00000000005ef87f8ca7014309ece7260bbcdaeb/orders?offset=0&limit=5', FETCH_RESPONSE_PARAMETERS);
        expect(orders.length).toEqual(5);
    }));
    test('Valid: Get last 5 trades changing options parameters', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const TRADES_RESPONSE = Array(5).fill(TRADE_RESPONSE);
        jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify(TRADES_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS });
        const trades = yield orderBookApi.getTrades(chainId, {
            owner: TRADE_RESPONSE.owner, // Trader
        });
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(`https://api.cow.fi/xdai/api/v1/trades?owner=${TRADE_RESPONSE.owner}`, FETCH_RESPONSE_PARAMETERS);
        expect(trades.length).toEqual(5);
    }));
    describe('Transform EthFlow orders', () => {
        test('getOrder', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _a;
            jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify(ETH_FLOW_ORDER_RESPONSE), {
                status: HTTP_STATUS_OK,
                headers: HEADERS,
            });
            // when
            const order = yield orderBookApi.getOrder(chainId, ETH_FLOW_ORDER_RESPONSE.uid);
            // then
            expect(order === null || order === void 0 ? void 0 : order.owner).toEqual(order === null || order === void 0 ? void 0 : order.onchainUser);
            expect(order === null || order === void 0 ? void 0 : order.validTo).toEqual((_a = order === null || order === void 0 ? void 0 : order.ethflowData) === null || _a === void 0 ? void 0 : _a.userValidTo);
            expect(order === null || order === void 0 ? void 0 : order.sellToken).toEqual(contracts_1.BUY_ETH_ADDRESS);
        }));
        test('getOrders', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _b;
            // given
            const ORDERS_RESPONSE = [ETH_FLOW_ORDER_RESPONSE, ORDER_RESPONSE];
            jest_fetch_mock_1.default.mockResponse(JSON.stringify(ORDERS_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS });
            // when
            const orders = yield orderBookApi.getOrders(chainId, {
                owner: '0x6810e776880c02933d47db1b9fc05908e5386b96',
                limit: 5,
                offset: 0,
            });
            // then
            // eth flow order
            expect(orders[0].owner).toEqual(orders[0].onchainUser);
            expect(orders[0].validTo).toEqual((_b = orders[0].ethflowData) === null || _b === void 0 ? void 0 : _b.userValidTo);
            expect(orders[0].sellToken).toEqual(contracts_1.BUY_ETH_ADDRESS);
            // regular order
            expect(orders[1].owner).toEqual(ORDER_RESPONSE.owner);
            expect(orders[1].validTo).toEqual(ORDER_RESPONSE.validTo);
            expect(orders[1].sellToken).toEqual(ORDER_RESPONSE.sellToken);
        }));
        test('getTxOrders', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _c;
            // given
            const ORDERS_RESPONSE = [ETH_FLOW_ORDER_RESPONSE, ORDER_RESPONSE];
            const txHash = '0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5';
            jest_fetch_mock_1.default.mockResponse(JSON.stringify(ORDERS_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS });
            // when
            const txOrders = yield orderBookApi.getTxOrders(chainId, txHash);
            // then
            // eth flow order
            expect(txOrders[0].owner).toEqual(txOrders[0].onchainUser);
            expect(txOrders[0].validTo).toEqual((_c = txOrders[0].ethflowData) === null || _c === void 0 ? void 0 : _c.userValidTo);
            expect(txOrders[0].sellToken).toEqual(contracts_1.BUY_ETH_ADDRESS);
            // regular order
            expect(txOrders[1].owner).toEqual(ORDER_RESPONSE.owner);
            expect(txOrders[1].validTo).toEqual(ORDER_RESPONSE.validTo);
            expect(txOrders[1].sellToken).toEqual(ORDER_RESPONSE.sellToken);
        }));
    });
    test('API getOrder() method should return order with "class" property', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify(Object.assign(Object.assign({}, ORDER_RESPONSE), { class: 'limit' })), {
            status: HTTP_STATUS_OK,
            headers: HEADERS,
        });
        // when
        const order = yield orderBookApi.getOrder(chainId, ORDER_RESPONSE.uid);
        // then
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(`https://api.cow.fi/xdai/api/v1/orders/${ORDER_RESPONSE.uid}`, FETCH_RESPONSE_PARAMETERS);
        expect(order === null || order === void 0 ? void 0 : order.class).toEqual('limit');
    }));
});
//# sourceMappingURL=api.spec.js.map