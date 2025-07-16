import { nativeCurrencyTemplate } from '../../common/consts/tokens'
import { RAW_CHAINS_FILES_PATH } from '../const/path'
import { ChainInfo, SupportedChainId } from '../types'

const bscLogo = `${RAW_CHAINS_FILES_PATH}/images/bsc-logo.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/bsc.ts
// and https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-56.json
export const bsc: ChainInfo = {
  id: SupportedChainId.BSC,
  label: 'BSC',
  eip155Label: 'BNB Smart Chain Mainnet',
  logo: { light: bscLogo, dark: bscLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.BSC,
    name: 'BNB Chain Native Token',
    symbol: 'BNB',
    logoUrl: bscLogo, // TODO: use BNB logo
  },
  addressPrefix: 'bnb',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 15921452,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://bsc-dataseed1.bnbchain.org'],
    },
  },
  color: '#F0B90B',
  website: {
    name: 'BNB Chain',
    url: 'https://www.bnbchain.org',
  },
  docs: {
    name: 'BNB Chain Docs',
    url: 'https://docs.bnbchain.org',
  },
  blockExplorer: {
    name: 'BNB Smart Chain Explorer',
    url: 'https://bscscan.com',
  },
}
