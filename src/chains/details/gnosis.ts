import { ChainInfo, SupportedChainId } from '../types'
import { baseNativeCurrency, WRAPPED_NATIVE_CURRENCIES } from '../../common/consts/tokens'
import { RAW_CHAINS_FILES_PATH } from '../const'

const gnosisChainLogo = `${RAW_CHAINS_FILES_PATH}/images/gnosis-logo.svg`

/**
 * Gnosis chain chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/gnosis.ts
 */
export const gnosisChain: ChainInfo = {
  id: SupportedChainId.GNOSIS_CHAIN,
  label: 'Gnosis Chain',
  nativeCurrency: {
    ...baseNativeCurrency,
    chainId: SupportedChainId.GNOSIS_CHAIN,
    name: 'xDAI',
    symbol: 'xDAI',
    logoUrl: WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN].logoUrl,
  },
  addressPrefix: 'gno',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 21022491,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.gnosischain.com'],
      webSocket: ['wss://rpc.gnosischain.com/wss'],
    },
  },
  color: '#07795B',
  logo: { light: gnosisChainLogo, dark: gnosisChainLogo },

  website: {
    name: 'Gnosis Chain',
    url: 'https://www.gnosischain.com',
  },
  docs: {
    name: 'Gnosis Chain Docs',
    url: 'https://docs.gnosischain.com',
  },
  blockExplorer: {
    name: 'Gnosisscan',
    url: 'https://gnosisscan.io',
  },
  bridges: [
    {
      name: 'Gnosis Chain Bridge',
      url: 'https://bridge.gnosischain.com',
    },
  ],
}
