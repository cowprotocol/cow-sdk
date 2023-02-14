import { SupportedChainId } from './chains'

export interface IpfsConfig {
  uri?: string
  writeUri?: string
  readUri?: string
  pinataApiKey?: string
  pinataApiSecret?: string
}

export interface EnvConfig {
  readonly apiUrl: string
  readonly subgraphUrl: string
}

export const PROD_CONFIG: { [key in SupportedChainId]: EnvConfig } = {
  [SupportedChainId.MAINNET]: {
    apiUrl: 'https://api.cow.fi/mainnet',
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow',
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    apiUrl: 'https://api.cow.fi/xdai',
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc',
  },
  [SupportedChainId.GOERLI]: {
    apiUrl: 'https://api.cow.fi/goerli',
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-goerli',
  },
}

export const STAGING_CONFIG: { [key in SupportedChainId]: EnvConfig } = {
  [SupportedChainId.MAINNET]: {
    apiUrl: 'https://barn.api.cow.fi/mainnet',
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-staging',
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    apiUrl: 'https://barn.api.cow.fi/xdai',
    subgraphUrl: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc-staging',
  },
  [SupportedChainId.GOERLI]: {
    apiUrl: 'https://barn.api.cow.fi/goerli',
    subgraphUrl: '',
  },
}
