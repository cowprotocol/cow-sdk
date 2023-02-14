import { AnyAppDataDocVersion } from '@cowprotocol/app-data';
export declare function getSerializedCID(hash: string): Promise<void | string>;
export declare function loadIpfsFromCid(cid: string, ipfsUri?: string): Promise<AnyAppDataDocVersion>;
