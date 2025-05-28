import { nativeCurrencyTemplate } from '../../constants/tokens'
import { ChainInfo } from '../types'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

const optimismLogo = `${RAW_CHAINS_FILES_PATH}/images/optimism-logo.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/optimism.ts
export const optimism: ChainInfo = {
  id: 10,
  label: 'Optimism',
  logo: { light: optimismLogo, dark: optimismLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: 10,
  },
  addressPrefix: 'op',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4286263,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.optimism.io'],
    },
  },
  color: '#ff0420',
  website: {
    name: 'Optimism',
    url: 'https://optimism.io',
  },
  docs: {
    name: 'Optimism Docs',
    url: 'https://docs.optimism.io',
  },
  blockExplorer: {
    name: 'Etherscan',
    url: 'https://optimistic.etherscan.io',
  },
}
