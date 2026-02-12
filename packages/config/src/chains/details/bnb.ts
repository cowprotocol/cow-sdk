import { ChainInfo, SupportedEvmChainId } from '../types'
import { nativeCurrencyTemplate } from '../../constants/tokens'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

const bnbLogo = `${RAW_CHAINS_FILES_PATH}/images/bnb-logo.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/bsc.ts
// and https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-56.json
export const bnb: ChainInfo = {
  id: SupportedEvmChainId.BNB,
  label: 'BNB',
  eip155Label: 'BNB Chain Mainnet',
  logo: { light: bnbLogo, dark: bnbLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedEvmChainId.BNB,
    name: 'BNB Chain Native Token',
    symbol: 'BNB',
    logoUrl: bnbLogo,
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
    name: 'Bscscan',
    url: 'https://bscscan.com',
  },
  bridges: [
    {
      name: 'BNB Chain Cross-Chain Bridge',
      url: 'https://www.bnbchain.org/en/bnb-chain-bridge',
    },
  ],
}
