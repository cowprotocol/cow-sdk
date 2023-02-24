"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadIpfsFromCid = exports.getSerializedCID = void 0;
const tslib_1 = require("tslib");
const ipfs_1 = require("../../common/ipfs");
function fromHexString(hexString) {
    const stringMatch = hexString.match(/.{1,2}/g);
    if (!stringMatch)
        return;
    return new Uint8Array(stringMatch.map((byte) => parseInt(byte, 16)));
}
function getSerializedCID(hash) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cidVersion = 0x1; //cidv1
        const codec = 0x70; //dag-pb
        const type = 0x12; //sha2-256
        const length = 32; //256 bits
        const _hash = hash.replace(/(^0x)/, '');
        const hexHash = fromHexString(_hash);
        if (!hexHash)
            return;
        const uint8array = Uint8Array.from([cidVersion, codec, type, length, ...hexHash]);
        const { CID } = yield Promise.resolve().then(() => tslib_1.__importStar(require('multiformats/cid')));
        return CID.decode(uint8array).toV0().toString();
    });
}
exports.getSerializedCID = getSerializedCID;
function loadIpfsFromCid(cid, ipfsUri = ipfs_1.DEFAULT_IPFS_READ_URI) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { default: fetch } = yield Promise.resolve().then(() => tslib_1.__importStar(require('cross-fetch')));
        const response = yield fetch(`${ipfsUri}/${cid}`);
        return yield response.json();
    });
}
exports.loadIpfsFromCid = loadIpfsFromCid;
//# sourceMappingURL=appData.js.map