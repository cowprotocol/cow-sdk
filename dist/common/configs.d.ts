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
export type EnvConfigs = Record<SupportedChainId, EnvConfig>;
export declare const PROD_CONFIG: EnvConfigs;
export declare const STAGING_CONFIG: EnvConfigs;
