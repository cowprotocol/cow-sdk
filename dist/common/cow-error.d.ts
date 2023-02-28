export declare class CowError extends Error {
    error_code?: string;
    constructor(message: string, error_code?: string);
}
export declare const logPrefix = "cow-sdk:";
