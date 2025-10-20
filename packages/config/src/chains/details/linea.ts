import { ChainInfo, SupportedChainId } from '../types'
import { nativeCurrencyTemplate, RAW_CHAINS_FILES_PATH } from '../../constants'

const light = `${RAW_CHAINS_FILES_PATH}/images/linea-logo-light.svg`
const dark = `${RAW_CHAINS_FILES_PATH}/images/linea-logo-dark.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/linea.ts
// and https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-59144.json
export const linea: ChainInfo = {
  id: SupportedChainId.LINEA,
  label: 'Linea',
  eip155Label: 'Linea Mainnet',
  logo: { light, dark },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.LINEA,
  },
  addressPrefix: 'linea',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 42,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.linea.build'],
    },
  },
  color: '#61dfff', // Brand assets https://linea.build/assets
  website: {
    name: 'Linea',
    url: 'https://linea.build/',
  },
  docs: {
    name: 'Linea Docs',
    url: 'https://docs.linea.build/',
  },
  blockExplorer: {
    name: 'LineaScan',
    url: 'https://lineascan.build/',
  },
  bridges: [
    {
      name: 'Linea Bridge',
      url: 'https://linea.build/hub/bridge',
    },
  ],
  isUnderDevelopment: true, // TODO: Remove when ready for production
}
