import { SupportedChainId } from './constants/chains'

export interface IpfsConfig {
  uri?: string
  writeUri?: string
  readUri?: string
  pinataApiKey?: string
  pinataApiSecret?: string
}

export interface EnvConfig {
  readonly apiUrl: string
}

export const PROD_CONFIG: { [key in SupportedChainId]: EnvConfig } = {
  [SupportedChainId.MAINNET]: {
    apiUrl: 'https://api.cow.fi/mainnet',
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    apiUrl: 'https://api.cow.fi/xdai',
  },
  [SupportedChainId.GOERLI]: {
    apiUrl: 'https://api.cow.fi/goerli',
  },
}

export const STAGING_CONFIG: { [key in SupportedChainId]: EnvConfig } = {
  [SupportedChainId.MAINNET]: {
    apiUrl: 'https://barn.api.cow.fi/mainnet',
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    apiUrl: 'https://barn.api.cow.fi/xdai',
  },
  [SupportedChainId.GOERLI]: {
    apiUrl: 'https://barn.api.cow.fi/goerli',
  },
}
