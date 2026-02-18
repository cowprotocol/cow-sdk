import { ChainInfo, NonEvmChains } from '../types'
import { RAW_CHAINS_FILES_PATH } from '../../constants'

const bitcoinLogo = `${RAW_CHAINS_FILES_PATH}/images/bitcoin-logo.svg`

export const bitcoin: ChainInfo = {
  id: NonEvmChains.BITCOIN,
  label: 'Bitcoin',
  eip155Label: 'Bitcoin',
  logo: { light: bitcoinLogo, dark: bitcoinLogo },
  nativeCurrency: {
    chainId: NonEvmChains.BITCOIN,
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    address: '', // there is no such a thing as an address for bitcoin
    logoUrl: bitcoinLogo,
  },
  addressPrefix: 'btc',
  isTestnet: false,
  contracts: {},
  rpcUrls: {
    default: {
      http: [],
    },
  },
  color: '#f7931a',
  website: {
    name: 'Bitcoin',
    url: 'https://bitcoin.org',
  },
  docs: {
    name: 'Bitcoin Docs',
    url: 'https://bitcoin.org/en/developer-documentation',
  },
  blockExplorer: {
    name: 'Blockstream Explorer',
    url: 'https://blockstream.info',
  },
}
