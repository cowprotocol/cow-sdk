import { SupportedChainId } from '../constants/chains'

interface EnvConfig {
  readonly apiUrl: string
}

export const PROD_CONFIG: { [key in SupportedChainId]: EnvConfig } = {
  [SupportedChainId.MAINNET]: {
    apiUrl: 'https://api.cow.fi/mainnet/api',
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    apiUrl: 'https://api.cow.fi/xdai/api',
  },
  [SupportedChainId.GOERLI]: {
    apiUrl: 'https://api.cow.fi/goerli/api',
  },
}

export const STAGING_CONFIG: { [key in SupportedChainId]: EnvConfig } = {
  [SupportedChainId.MAINNET]: {
    apiUrl: 'https://barn.api.cow.fi/mainnet/api',
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    apiUrl: 'https://barn.api.cow.fi/xdai/api',
  },
  [SupportedChainId.GOERLI]: {
    apiUrl: 'https://barn.api.cow.fi/goerli/api',
  },
}
