import { ChainInfo, SupportedChainId } from '../types'
import { nativeCurrencyTemplate } from '../../common/consts/tokens'
import { RAW_CHAINS_FILES_PATH } from '../const/path'

const baseLogo = `${RAW_CHAINS_FILES_PATH}/images/base-logo.svg`

/**
 * Base chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/base.ts
 */
export const base: ChainInfo = {
  id: SupportedChainId.BASE,
  label: 'Base',
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.BASE,
  },
  addressPrefix: 'base',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 5022,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
  },
  color: '#0052FF',
  logo: { light: baseLogo, dark: baseLogo },

  website: {
    name: 'Base',
    url: 'https://base.org',
  },
  docs: {
    name: 'Base Docs',
    url: 'https://docs.base.org',
  },
  blockExplorer: {
    name: 'BaseScan',
    url: 'https://basescan.org',
  },
  bridges: [
    {
      name: 'Superchain Bridges',
      url: 'https://bridge.base.org/deposit',
    },
  ],
}
