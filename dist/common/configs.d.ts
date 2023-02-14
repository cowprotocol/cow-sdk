import { SupportedChainId } from './chains';
export interface IpfsConfig {
    uri?: string;
    writeUri?: string;
    readUri?: string;
    pinataApiKey?: string;
    pinataApiSecret?: string;
}
export interface EnvConfig {
    readonly apiUrl: string;
    readonly subgraphUrl: string;
}
export declare const PROD_CONFIG: {
    [key in SupportedChainId]: EnvConfig;
};
export declare const STAGING_CONFIG: {
    [key in SupportedChainId]: EnvConfig;
};
