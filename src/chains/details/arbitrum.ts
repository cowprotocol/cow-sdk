import { ChainInfo, SupportedChainId } from '../types'
import { baseNativeCurrency } from '../../common/consts/tokens'
import { RAW_CHAINS_FILES_PATH } from '../const'

export const arbitrumOneLogoLight = `${RAW_CHAINS_FILES_PATH}/images/arbitrum-one-logo-light.svg`
export const arbitrumOneLogoDark = `${RAW_CHAINS_FILES_PATH}/images/arbitrum-one-logo-dark.svg`

/**
 * Arbitrum chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/arbitrum.ts
 */
export const arbitrumOne: ChainInfo = {
  id: SupportedChainId.ARBITRUM_ONE,
  label: 'Arbitrum One',
  nativeCurrency: {
    ...baseNativeCurrency,
    chainId: SupportedChainId.ARBITRUM_ONE,
  },
  addressPrefix: 'arb1',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 7654707,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://arb1.arbitrum.io/rpc'],
    },
  },
  color: '#1B4ADD',
  logo: { light: arbitrumOneLogoLight, dark: arbitrumOneLogoDark },

  website: {
    name: 'Arbitrum',
    url: 'https://arbitrum.io',
  },
  docs: {
    name: 'Arbitrum Docs',
    url: 'https://docs.arbitrum.io',
  },
  blockExplorer: {
    name: 'Arbiscan',
    url: 'https://arbiscan.io',
  },
  bridges: [
    {
      name: 'Arbitrum Bridge',
      url: 'https://bridge.arbitrum.io',
    },
  ],
}
