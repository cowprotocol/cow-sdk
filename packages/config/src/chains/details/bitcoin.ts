import { nativeCurrencyTemplate } from '../../constants/tokens'
import { ChainInfo, SupportedBitcoinChainId } from '../types'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

const bitcoinLogo = `${RAW_CHAINS_FILES_PATH}/images/bitcoin-logo.svg`

// Bitcoin doesn't have a numeric chain ID like EVM chains
export const bitcoin: ChainInfo = {
  id: SupportedBitcoinChainId.MAINNET,
  label: 'Bitcoin',
  eip155Label: 'Bitcoin',
  logo: { light: bitcoinLogo, dark: bitcoinLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedBitcoinChainId.MAINNET,
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
  },
  addressPrefix: 'btc',
  isTestnet: false,
  contracts: {}, // think how to replace it
  rpcUrls: {
    default: {
      http: [], // think how to replace it
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
