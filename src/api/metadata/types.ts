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
}

export type MetadataDoc = {
  referrer?: ReferralMetadata
  quote?: QuoteMetadata
}

export type AppDataDoc = {
  version: string
  appCode?: string
  metadata: MetadataDoc
}
