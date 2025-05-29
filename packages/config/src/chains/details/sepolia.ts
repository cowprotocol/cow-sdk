import { ChainInfo, SupportedChainId } from '../types'
import { nativeCurrencyTemplate } from '../../constants/tokens'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

const sepoliaLogo = `${RAW_CHAINS_FILES_PATH}/images/sepolia-logo.svg`

/**
 * Sepolia chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/sepolia.ts
 */
export const sepolia: ChainInfo = {
  id: SupportedChainId.SEPOLIA,
  label: 'Sepolia',
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.SEPOLIA,
  },
  addressPrefix: 'sep',
  isTestnet: true,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 751532,
    },
    ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
    ensUniversalResolver: {
      address: '0xc8Af999e38273D658BE1b921b88A9Ddf005769cC',
      blockCreated: 5_317_080,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.drpc.org'],
    },
  },
  color: '#C12FF2',
  logo: { light: sepoliaLogo, dark: sepoliaLogo },

  website: {
    name: 'Ethereum',
    url: 'https://sepolia.dev',
  },
  docs: {
    name: 'Sepolia Docs',
    url: 'https://ethereum.org/en/developers/docs/networks/#sepolia',
  },
  blockExplorer: {
    name: 'Etherscan',
    url: 'https://sepolia.etherscan.io',
  },
}
