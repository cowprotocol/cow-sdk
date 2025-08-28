import { nativeCurrencyTemplate } from '../../constants/tokens'
import { ChainInfo, SupportedChainId } from '../types'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

const polygonLogo = `${RAW_CHAINS_FILES_PATH}/images/polygon-logo.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/polygon.ts
export const polygon: ChainInfo = {
  id: SupportedChainId.POLYGON,
  label: 'Polygon',
  eip155Label: 'Polygon Mainnet',
  logo: { light: polygonLogo, dark: polygonLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.POLYGON,
    name: 'POL',
    symbol: 'POL',
    logoUrl: polygonLogo,
  },
  addressPrefix: 'matic',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25770160,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://polygon-rpc.com'],
    },
  },
  color: '#8247e5',
  website: {
    name: 'Polygon',
    url: 'https://polygon.technology',
  },
  docs: {
    name: 'Polygon Docs',
    url: 'https://docs.polygon.technology',
  },
  blockExplorer: {
    name: 'Polygonscan',
    url: 'https://polygonscan.com',
  },
}
