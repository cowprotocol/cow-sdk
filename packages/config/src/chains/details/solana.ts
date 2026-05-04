import { NonEvmChainInfo, SupportedChainId } from '../types'
import { RAW_CHAINS_FILES_PATH, SOL_NATIVE_CURRENCY_ADDRESS } from '../../constants'

const solanaLogo = `${RAW_CHAINS_FILES_PATH}/images/solana-logo.svg`

export const solana: NonEvmChainInfo = {
  id: SupportedChainId.SOLANA,
  label: 'Solana',
  logo: { light: solanaLogo, dark: solanaLogo },
  nativeCurrency: {
    chainId: SupportedChainId.SOLANA,
    address: SOL_NATIVE_CURRENCY_ADDRESS,
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    logoUrl: solanaLogo,
  },
  addressPrefix: 'sol',
  isTestnet: false,
  color: '#9945FF',
  website: {
    name: 'Solana',
    url: 'https://solana.com',
  },
  docs: {
    name: 'Solana Docs',
    url: 'https://docs.solana.com',
  },
  blockExplorer: {
    name: 'Solana Explorer',
    url: 'https://explorer.solana.com',
  },
}
