interface Metadata {
  version: string
}

export interface ReferralMetadata extends Metadata {
  address: string
}

export interface QuoteMetadata extends Metadata {
  id?: string
  sellAmount: string
  buyAmount: string
  slippageInBips?: string
}

export type MetadataDoc = {
  referrer?: ReferralMetadata
  quote?: QuoteMetadata
}

export type OptionalAppDataProperties = {
  appCode?: string
  environment?: string
}

export type AppDataDoc = {
  version: string
  metadata: MetadataDoc
} & OptionalAppDataProperties

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
