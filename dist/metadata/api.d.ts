import { validateAppDataDoc } from '@cowprotocol/app-data';
import { AnyAppDataDocVersion, LatestAppDataDocVersion, IpfsHashInfo, GenerateAppDataDocParams } from './types';
import { IpfsConfig } from '../common/configs';
export declare class MetadataApi {
    /**
     * Creates an appDataDoc with the latest version format
     *
     * Without params creates a default minimum appData doc
     * Optionally creates metadata docs
     */
    generateAppDataDoc(params?: GenerateAppDataDocParams): LatestAppDataDocVersion;
    /**
     * Wrapper around @cowprotocol/app-data getAppDataSchema
     *
     * Returns the appData schema for given version, if any
     * Throws CowError when version doesn't exist
     */
    getAppDataSchema(version: string): Promise<AnyAppDataDocVersion>;
    /**
     * Wrapper around @cowprotocol/app-data validateAppDataDoc
     *
     * Validates given doc against the doc's own version
     */
    validateAppDataDoc(appDataDoc: AnyAppDataDocVersion): ReturnType<typeof validateAppDataDoc>;
    decodeAppData(hash: string): Promise<void | AnyAppDataDocVersion>;
    cidToAppDataHex(ipfsHash: string): Promise<string | void>;
    appDataHexToCid(hash: string): Promise<string | void>;
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
    calculateAppDataHash(appData: AnyAppDataDocVersion): Promise<IpfsHashInfo | void>;
    uploadMetadataDocToIpfs(appDataDoc: AnyAppDataDocVersion, ipfsConfig: IpfsConfig): Promise<string | void>;
}
