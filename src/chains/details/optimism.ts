import { nativeCurrencyTemplate } from '../../common/consts/tokens'
import { ChainInfo } from '../types'
import { RAW_CHAINS_FILES_PATH } from '../const'

const optimismLogo = `${RAW_CHAINS_FILES_PATH}/images/optimism-logo.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/optimism.ts
export const optimism: ChainInfo = {
  id: 10,
  label: 'Optimism',
  logo: { light: optimismLogo, dark: optimismLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: 10,
    logoUrl:
      'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png',
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
