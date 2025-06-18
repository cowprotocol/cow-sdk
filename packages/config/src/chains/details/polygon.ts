import { nativeCurrencyTemplate } from '../../constants/tokens'
import { ChainInfo } from '../types'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

const polygonLogo = `${RAW_CHAINS_FILES_PATH}/images/polygon-logo.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/polygon.ts
export const polygon: ChainInfo = {
  id: 137,
  label: 'Polygon',
  logo: { light: polygonLogo, dark: polygonLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: 137,
    name: 'POL',
    symbol: 'POL',
    logoUrl: polygonLogo,
  },
  addressPrefix: 'op',
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
  color: '#ff0420',
  website: {
    name: 'Polygon',
    url: 'https://polygon.technology',
  },
  docs: {
    name: 'Polygon Docs',
    url: 'https://docs.polygon.technology',
  },
  blockExplorer: {
    name: 'PolygonScan',
    url: 'https://polygonscan.com',
  },
}
