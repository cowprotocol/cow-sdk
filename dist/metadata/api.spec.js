"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jest_fetch_mock_1 = tslib_1.__importDefault(require("jest-fetch-mock"));
const ipfs_1 = require("../common/ipfs");
const api_1 = require("./api");
const metadataApi = new api_1.MetadataApi();
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_ERROR = 500;
const DEFAULT_APP_DATA_DOC = {
    version: '0.5.0',
    appCode: 'CowSwap',
    metadata: {},
};
const IPFS_HASH = 'QmYNdAx6V62cUiHGBujwzeaB5FumAKCmPVeaV8DUvrU97F';
const APP_DATA_HEX = '0x95164af4bca0ce893339efb678065e705e16e2dc4e6d9c22fcb9d6e54efab8b2';
const PINATA_API_KEY = 'apikey';
const PINATA_API_SECRET = 'apiSecret';
const CUSTOM_APP_DATA_DOC = Object.assign(Object.assign({}, DEFAULT_APP_DATA_DOC), { environment: 'test', metadata: {
        referrer: {
            address: '0x1f5B740436Fc5935622e92aa3b46818906F416E9',
            version: '0.1.0',
        },
        quote: {
            slippageBips: '1',
            version: '0.2.0',
        },
    } });
beforeEach(() => {
    jest_fetch_mock_1.default.resetMocks();
});
afterEach(() => {
    jest.restoreAllMocks();
});
describe('Metadata api', () => {
    describe('generateAppDataDoc', () => {
        test('Creates appDataDoc with empty metadata ', () => {
            // when
            const appDataDoc = metadataApi.generateAppDataDoc({});
            // then
            expect(appDataDoc).toEqual(DEFAULT_APP_DATA_DOC);
        });
        test('Creates appDataDoc with custom metadata ', () => {
            // given
            const params = {
                appDataParams: {
                    environment: CUSTOM_APP_DATA_DOC.environment,
                },
                metadataParams: {
                    referrerParams: CUSTOM_APP_DATA_DOC.metadata.referrer,
                    quoteParams: CUSTOM_APP_DATA_DOC.metadata.quote,
                },
            };
            // when
            const appDataDoc = metadataApi.generateAppDataDoc(params);
            // then
            expect(appDataDoc).toEqual(CUSTOM_APP_DATA_DOC);
        });
    });
    describe('uploadMetadataDocToIpfs', () => {
        test('Fails without passing credentials', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // given
            const appDataDoc = metadataApi.generateAppDataDoc({
                metadataParams: {
                    referrerParams: CUSTOM_APP_DATA_DOC.metadata.referrer,
                },
            });
            // when
            const promise = metadataApi.uploadMetadataDocToIpfs(appDataDoc, {});
            // then
            yield expect(promise).rejects.toThrow('You need to pass IPFS api credentials.');
        }));
        test('Fails with wrong credentials', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // given
            jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify({ error: { details: 'IPFS api keys are invalid' } }), {
                status: HTTP_STATUS_INTERNAL_ERROR,
            });
            const appDataDoc = metadataApi.generateAppDataDoc({});
            // when
            const promise = metadataApi.uploadMetadataDocToIpfs(appDataDoc, {
                pinataApiKey: PINATA_API_KEY,
                pinataApiSecret: PINATA_API_SECRET,
            });
            // then
            yield expect(promise).rejects.toThrow('IPFS api keys are invalid');
            expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
        }));
        test('Uploads to IPFS', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // given
            jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify({ IpfsHash: IPFS_HASH }), { status: HTTP_STATUS_OK });
            const appDataDoc = metadataApi.generateAppDataDoc({
                metadataParams: { referrerParams: CUSTOM_APP_DATA_DOC.metadata.referrer },
            });
            // when
            const appDataHex = yield metadataApi.uploadMetadataDocToIpfs(appDataDoc, {
                pinataApiKey: PINATA_API_KEY,
                pinataApiSecret: PINATA_API_SECRET,
            });
            // then
            expect(appDataHex).toEqual(APP_DATA_HEX);
            expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
            expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(ipfs_1.DEFAULT_IPFS_WRITE_URI + '/pinning/pinJSONToIPFS', {
                body: JSON.stringify({ pinataContent: appDataDoc, pinataMetadata: { name: 'appData' } }),
                headers: {
                    'Content-Type': 'application/json',
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET,
                },
                method: 'POST',
            });
        }));
    });
    describe('decodeAppData', () => {
        test('Decodes appData', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // given
            jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify(CUSTOM_APP_DATA_DOC), { status: HTTP_STATUS_OK });
            // when
            const appDataDoc = yield metadataApi.decodeAppData(APP_DATA_HEX);
            // then
            expect(jest_fetch_mock_1.default).toHaveBeenCalledTimes(1);
            expect(jest_fetch_mock_1.default).toHaveBeenCalledWith(`${ipfs_1.DEFAULT_IPFS_READ_URI}/${IPFS_HASH}`);
            expect(appDataDoc).toEqual(CUSTOM_APP_DATA_DOC);
        }));
        test('Throws with wrong hash format', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // given
            jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify({}), { status: HTTP_STATUS_INTERNAL_ERROR });
            // when
            const promise = metadataApi.decodeAppData('invalidHash');
            // then
            yield expect(promise).rejects.toThrow('Error decoding AppData: Incorrect length');
        }));
    });
    describe('appDataHexToCid', () => {
        test('Happy path', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // when
            const decodedAppDataHex = yield metadataApi.appDataHexToCid(APP_DATA_HEX);
            // then
            expect(decodedAppDataHex).toEqual(IPFS_HASH);
        }));
        test('Throws with wrong hash format ', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // when
            const promise = metadataApi.appDataHexToCid('invalidHash');
            // then
            yield expect(promise).rejects.toThrow('Incorrect length');
        }));
    });
    describe('calculateAppDataHash', () => {
        test('Happy path', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // when
            const result = yield metadataApi.calculateAppDataHash(DEFAULT_APP_DATA_DOC);
            // then
            expect(result).not.toBeFalsy();
            expect(result).toEqual({ cidV0: IPFS_HASH, appDataHash: APP_DATA_HEX });
        }));
        test('Throws with invalid appDoc', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // given
            const doc = Object.assign(Object.assign({}, DEFAULT_APP_DATA_DOC), { metadata: { quote: { sellAmount: 'fsdfas', buyAmount: '41231', version: '0.1.0' } } });
            // when
            const promise = metadataApi.calculateAppDataHash(doc);
            // then
            yield expect(promise).rejects.toThrow('Invalid appData provided');
        }));
        test('Throws when cannot derive the appDataHash', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // given
            const mock = jest.fn();
            metadataApi.cidToAppDataHex = mock;
            // when
            const promise = metadataApi.calculateAppDataHash(DEFAULT_APP_DATA_DOC);
            // then
            yield expect(promise).rejects.toThrow('Failed to calculate appDataHash');
            expect(mock).toBeCalledTimes(1);
            expect(mock).toHaveBeenCalledWith(IPFS_HASH);
        }));
    });
    describe('validateAppDataDocument', () => {
        const v010Doc = Object.assign(Object.assign({}, DEFAULT_APP_DATA_DOC), { metatadata: {
                referrer: { address: '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9', version: '0.1.0' },
            } });
        const v040Doc = Object.assign(Object.assign({}, v010Doc), { version: '0.4.0', metadata: Object.assign(Object.assign({}, v010Doc.metadata), { quote: { slippageBips: '1', version: '0.2.0' } }) });
        test('Version matches schema', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // when
            const v010Validation = yield metadataApi.validateAppDataDoc(v010Doc);
            const v040Validation = yield metadataApi.validateAppDataDoc(v040Doc);
            // then
            expect(v010Validation.success).toBeTruthy();
            expect(v040Validation.success).toBeTruthy();
        }));
        test("Version doesn't match schema", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // when
            const v030Validation = yield metadataApi.validateAppDataDoc(Object.assign(Object.assign({}, v040Doc), { version: '0.3.0' }));
            // then
            expect(v030Validation.success).toBeFalsy();
            expect(v030Validation.errors).toEqual("data/metadata/quote must have required property 'sellAmount'");
        }));
        test("Version doesn't exist", () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // when
            const validation = yield metadataApi.validateAppDataDoc(Object.assign(Object.assign({}, v010Doc), { version: '0.0.0' }));
            // then
            expect(validation.success).toBeFalsy();
            expect(validation.errors).toEqual("AppData version 0.0.0 doesn't exist");
        }));
    });
    describe('getAppDataSchema', () => {
        test('Returns existing schema', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // given
            const version = '0.4.0';
            // when
            const schema = yield metadataApi.getAppDataSchema(version);
            // then
            expect(schema.$id).toMatch(version);
        }));
        test('Throws on invalid schema', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            // given
            const version = '0.0.0';
            // when
            const promise = metadataApi.getAppDataSchema(version);
            // then
            yield expect(promise).rejects.toThrow(`AppData version ${version} doesn't exist`);
        }));
    });
});
//# sourceMappingURL=api.spec.js.map