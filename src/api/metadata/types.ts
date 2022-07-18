export { AnyAppDataDocVersion, LatestAppDataDocVersion } from '@cowprotocol/app-data'

export type IpfsHashInfo = {
  /**
   * IPFS's content identifier v0
   * Begins with Qm. See https://docs.ipfs.io/concepts/content-addressing/#identifier-formats
   */
  cidV0: string
  /**
   * IPFS's content identifier hash
   * NOT a file hash. See https://docs.ipfs.io/concepts/hashing/#important-hash-characteristics
   */
  appDataHash: string
}
