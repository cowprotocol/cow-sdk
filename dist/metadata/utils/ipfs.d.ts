import { AnyAppDataDocVersion } from '../types';
type PinataPinResponse = {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
};
export interface Ipfs {
    uri?: string;
    writeUri?: string;
    readUri?: string;
    pinataApiKey?: string;
    pinataApiSecret?: string;
}
export declare function pinJSONToIPFS(file: unknown, { writeUri, pinataApiKey, pinataApiSecret }: Ipfs): Promise<PinataPinResponse>;
export declare function calculateIpfsCidV0(doc: AnyAppDataDocVersion): Promise<string>;
export {};
