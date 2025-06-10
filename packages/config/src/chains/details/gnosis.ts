import { ChainInfo, SupportedChainId } from '../types'
import { NATIVE_CURRENCY_ADDRESS, nativeCurrencyTemplate, TOKEN_LIST_IMAGES_PATH } from '../../constants/tokens'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

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
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.GNOSIS_CHAIN,
    name: 'xDAI',
    symbol: 'xDAI',
    logoUrl: `${TOKEN_LIST_IMAGES_PATH}/100/${NATIVE_CURRENCY_ADDRESS}/logo.png`,
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
