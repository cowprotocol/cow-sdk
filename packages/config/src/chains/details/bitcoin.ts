import { NonEvmChainInfo, NonEvmChains } from '../types'
import { BTC_CURRENCY_ADDRESS, RAW_CHAINS_FILES_PATH } from '../../constants'

const bitcoinLogo = `${RAW_CHAINS_FILES_PATH}/images/bitcoin-logo.svg`

export const bitcoin: NonEvmChainInfo = {
  id: NonEvmChains.BITCOIN,
  label: 'Bitcoin',
  logo: { light: bitcoinLogo, dark: bitcoinLogo },
  nativeCurrency: {
    chainId: NonEvmChains.BITCOIN,
    address: BTC_CURRENCY_ADDRESS,
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    logoUrl: bitcoinLogo,
  },
  addressPrefix: 'btc',
  isTestnet: false,
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
