type Metadata = {
  version: string
}

export type ReferralMetadata = Metadata & {
  address: string
}

export type QuoteMetadata = Metadata & {
  slippageBips: string
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
