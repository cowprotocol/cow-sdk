import { nativeCurrencyTemplate } from '../../constants/tokens'
import { ChainInfo, SupportedChainId } from '../types'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

const ethereumLogo = `${RAW_CHAINS_FILES_PATH}/images/mainnet-logo.svg`

/**
 * Mainnet chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/mainnet.ts
 */
export const mainnet: ChainInfo = {
  id: SupportedChainId.MAINNET,
  label: 'Ethereum',
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.MAINNET,
  },
  addressPrefix: 'eth',
  isTestnet: false,
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensUniversalResolver: {
      address: '0xce01f8eee7E479C928F8919abD53E553a36CeF67',
      blockCreated: 19_258_213,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14_353_601,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://eth.merkle.io'],
    },
  },
  color: '#62688F',
  logo: { light: ethereumLogo, dark: ethereumLogo },

  website: {
    name: 'Ethereum',
    url: 'https://ethereum.org',
  },
  docs: {
    name: 'Ethereum Docs',
    url: 'https://ethereum.org/en/developers/docs',
  },
  blockExplorer: {
    name: 'Etherscan',
    url: 'https://etherscan.io',
  },
}
