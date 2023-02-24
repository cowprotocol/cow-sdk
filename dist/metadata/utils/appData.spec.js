"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jest_fetch_mock_1 = tslib_1.__importDefault(require("jest-fetch-mock"));
const appData_1 = require("./appData");
const ipfs_1 = require("../../common/ipfs");
const INVALID_CID_LENGTH = 'Incorrect length';
describe('getSerializedCID', () => {
    test('Serializes hash into CID', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        const hash = '0xa6c81f4ca727252a05b108f1742a07430f28d474d2a3492d8f325746824d22e5';
        const expected = 'QmZZhNnqMF1gRywNKnTPuZksX7rVjQgTT3TJAZ7R6VE3b2';
        // when
        const cidV0 = yield (0, appData_1.getSerializedCID)(hash);
        // then
        expect(cidV0).toEqual(expected);
    }));
    test('Throws on invalid appData hash', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        const invalidHash = '0xa6c81f4ca727252a05b108f1742';
        // when
        const promise = (0, appData_1.getSerializedCID)(invalidHash);
        // then
        yield expect(promise).rejects.toThrow(INVALID_CID_LENGTH);
    }));
});
describe('loadIpfsFromCid', () => {
    test('Valid IPFS appData from CID', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // given
        const validSerializedCidV0 = 'QmZZhNnqMF1gRywNKnTPuZksX7rVjQgTT3TJAZ7R6VE3b2';
        const expected = '{"appCode":"CowSwap","metadata":{"referrer":{"address":"0x1f5B740436Fc5935622e92aa3b46818906F416E9","version":"0.1.0"}},"version":"0.1.0"}';
        jest_fetch_mock_1.default.mockResponseOnce(expected);
        // when
        const appDataDocument = yield (0, appData_1.loadIpfsFromCid)(validSerializedCidV0);
        // then
        expect(appDataDocument).toEqual(JSON.parse(expected));
        expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(`${ipfs_1.DEFAULT_IPFS_READ_URI}/${validSerializedCidV0}`);
    }));
});
//# sourceMappingURL=appData.spec.js.map