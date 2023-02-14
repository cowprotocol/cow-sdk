"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateIpfsCidV0 = exports.pinJSONToIPFS = void 0;
const tslib_1 = require("tslib");
const cow_error_1 = require("../../common/cow-error");
const ipfs_1 = require("../../common/ipfs");
function pinJSONToIPFS(file, { writeUri = ipfs_1.DEFAULT_IPFS_WRITE_URI, pinataApiKey = '', pinataApiSecret = '' }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { default: fetch } = yield Promise.resolve().then(() => tslib_1.__importStar(require('cross-fetch')));
        if (!pinataApiKey || !pinataApiSecret) {
            throw new cow_error_1.CowError('You need to pass IPFS api credentials.');
        }
        const body = JSON.stringify({
            pinataContent: file,
            pinataMetadata: { name: 'appData' },
        });
        const pinataUrl = `${writeUri}/pinning/pinJSONToIPFS`;
        const response = yield fetch(pinataUrl, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json',
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataApiSecret,
            },
        });
        const data = yield response.json();
        if (response.status !== 200) {
            throw new Error(data.error.details || data.error);
        }
        return data;
    });
}
exports.pinJSONToIPFS = pinJSONToIPFS;
function calculateIpfsCidV0(doc) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const docString = JSON.stringify(doc);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { of } = yield Promise.resolve().then(() => tslib_1.__importStar(require('ipfs-only-hash')));
        return of(docString, { cidVersion: 0 });
    });
}
exports.calculateIpfsCidV0 = calculateIpfsCidV0;
//# sourceMappingURL=ipfs.js.map