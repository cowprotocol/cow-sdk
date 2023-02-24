"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPrefix = exports.CowError = void 0;
class CowError extends Error {
    constructor(message, error_code) {
        super(message);
        this.error_code = error_code;
    }
}
exports.CowError = CowError;
exports.logPrefix = 'cow-sdk:';
//# sourceMappingURL=cow-error.js.map