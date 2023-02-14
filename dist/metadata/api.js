"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataApi = void 0;
const tslib_1 = require("tslib");
const app_data_1 = require("@cowprotocol/app-data");
const appData_1 = require("./utils/appData");
const ipfs_1 = require("./utils/ipfs");
const cow_error_1 = require("../common/cow-error");
const DEFAULT_APP_CODE = 'CowSwap';
class MetadataApi {
    /**
     * Creates an appDataDoc with the latest version format
     *
     * Without params creates a default minimum appData doc
     * Optionally creates metadata docs
     */
    generateAppDataDoc(params) {
        const { appDataParams, metadataParams } = params || {};
        const { referrerParams, quoteParams, orderClassParams } = metadataParams || {};
        const metadata = {};
        if (referrerParams) {
            metadata.referrer = (0, app_data_1.createReferrerMetadata)(referrerParams);
        }
        if (quoteParams) {
            metadata.quote = (0, app_data_1.createQuoteMetadata)(quoteParams);
        }
        if (orderClassParams) {
            metadata.orderClass = (0, app_data_1.createOrderClassMetadata)(orderClassParams);
        }
        const appCode = (appDataParams === null || appDataParams === void 0 ? void 0 : appDataParams.appCode) || DEFAULT_APP_CODE;
        return (0, app_data_1.createAppDataDoc)(Object.assign(Object.assign({}, appDataParams), { appCode, metadata }));
    }
    /**
     * Wrapper around @cowprotocol/app-data getAppDataSchema
     *
     * Returns the appData schema for given version, if any
     * Throws CowError when version doesn't exist
     */
    getAppDataSchema(version) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                return yield (0, app_data_1.getAppDataSchema)(version);
            }
            catch (e) {
                // Wrapping @cowprotocol/app-data Error into CowError
                const error = e;
                throw new cow_error_1.CowError(error.message);
            }
        });
    }
    /**
     * Wrapper around @cowprotocol/app-data validateAppDataDoc
     *
     * Validates given doc against the doc's own version
     */
    validateAppDataDoc(appDataDoc) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (0, app_data_1.validateAppDataDoc)(appDataDoc);
        });
    }
    decodeAppData(hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const cidV0 = yield (0, appData_1.getSerializedCID)(hash);
                if (!cidV0)
                    throw new cow_error_1.CowError('Error getting serialized CID');
                return (0, appData_1.loadIpfsFromCid)(cidV0);
            }
            catch (e) {
                const error = e;
                console.error('Error decoding AppData:', error);
                throw new cow_error_1.CowError('Error decoding AppData: ' + error.message);
            }
        });
    }
    cidToAppDataHex(ipfsHash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { CID } = yield Promise.resolve().then(() => tslib_1.__importStar(require('multiformats/cid')));
            const { digest } = CID.parse(ipfsHash).multihash;
            return `0x${Buffer.from(digest).toString('hex')}`;
        });
    }
    appDataHexToCid(hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cidV0 = yield (0, appData_1.getSerializedCID)(hash);
            if (!cidV0)
                throw new cow_error_1.CowError('Error getting serialized CID');
            return cidV0;
        });
    }
    /**
     * Calculates appDataHash WITHOUT publishing file to IPFS
     *
     * This method is intended to quickly generate the appDataHash independent
     * of IPFS upload/pinning
     * The hash is deterministic thus uploading it to IPFS will give you the same
     * result
     *
     * WARNING!
     * One important caveat is that - like `uploadMetadataDocToIpfs` method - the
     * calculation is done with a stringified file without a new line at the end.
     * That means that you will get different results if the file is uploaded
     * directly as a file. For example:
     *
     * Consider the content `hello world`.
     *
     * Using IPFS's cli tool to updload a file with the contents above
     * (`ipfs add file`), it'll have the line ending and result in this CIDv0:
     * QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o
     *
     * While using this method - and `uploadMetadataDocToIpfs` - will give you
     * this CIDv0:
     * Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD
     *
     * @param appData
     */
    calculateAppDataHash(appData) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const validation = yield this.validateAppDataDoc(appData);
            if (!(validation === null || validation === void 0 ? void 0 : validation.success)) {
                throw new cow_error_1.CowError('Invalid appData provided', validation === null || validation === void 0 ? void 0 : validation.errors);
            }
            try {
                const cidV0 = yield (0, ipfs_1.calculateIpfsCidV0)(appData);
                const appDataHash = yield this.cidToAppDataHex(cidV0);
                if (!appDataHash) {
                    throw new cow_error_1.CowError(`Could not extract appDataHash from calculated cidV0 ${cidV0}`);
                }
                return { cidV0, appDataHash };
            }
            catch (e) {
                const error = e;
                throw new cow_error_1.CowError('Failed to calculate appDataHash', error.message);
            }
        });
    }
    uploadMetadataDocToIpfs(appDataDoc, ipfsConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { IpfsHash } = yield (0, ipfs_1.pinJSONToIPFS)(appDataDoc, ipfsConfig);
            return this.cidToAppDataHex(IpfsHash);
        });
    }
}
exports.MetadataApi = MetadataApi;
//# sourceMappingURL=api.js.map