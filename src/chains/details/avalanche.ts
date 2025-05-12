import { nativeCurrencyTemplate } from '../../common/consts/tokens'
import { ChainInfo, SupportedChainId } from '../types'
import { RAW_CHAINS_FILES_PATH } from '../const/path'

const avalancheLogo = `${RAW_CHAINS_FILES_PATH}/images/avalanche-logo.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/avalanche.ts
export const avalanche: ChainInfo = {
  id: SupportedChainId.AVALANCHE,
  label: 'Avalanche',
  logo: { light: avalancheLogo, dark: avalancheLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.AVALANCHE,
    name: 'Avalanche',
    symbol: 'AVAX',
    logoUrl: avalancheLogo,
  },
  addressPrefix: 'avax',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11907934,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://api.avax.network/ext/bc/C/rpc'],
    },
  },
  color: '#ff3944',
  website: {
    name: 'Avalanche',
    url: 'https://www.avax.network/',
  },
  docs: {
    name: 'Avalanche Docs',
    url: 'https://build.avax.network/docs',
  },
  blockExplorer: {
    name: 'SnowTrace',
    url: 'https://snowtrace.io',
  },
}
