import {
  createAppDataDoc,
  createOrderClassMetadata,
  createQuoteMetadata,
  createReferrerMetadata,
} from '@cowprotocol/app-data'

export { AnyAppDataDocVersion, LatestAppDataDocVersion } from '@cowprotocol/app-data'

export type GenerateAppDataDocParams = {
  appDataParams?: Omit<Parameters<typeof createAppDataDoc>[0], 'metadata'>
  metadataParams?: {
    referrerParams?: Parameters<typeof createReferrerMetadata>[0]
    quoteParams?: Parameters<typeof createQuoteMetadata>[0]
    orderClassParams?: Parameters<typeof createOrderClassMetadata>[0]
  }
}

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
