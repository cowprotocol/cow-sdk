import { nativeCurrencyTemplate, TOKEN_LIST_IMAGES_PATH } from '../../common/consts/tokens'
import { RAW_CHAINS_FILES_PATH } from '../const/path'
import { ChainInfo, SupportedChainId } from '../types'

const lensLogo = `${RAW_CHAINS_FILES_PATH}/images/lens-logo.svg`

const GHO_MAINNET_ADDRESS = '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f'
const GHO_MAINNET_LOGO_URL = `${TOKEN_LIST_IMAGES_PATH}/1/${GHO_MAINNET_ADDRESS}/logo.png`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/lens.ts
// and https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-232.json
export const lens: ChainInfo = {
  id: SupportedChainId.LENS,
  label: 'Lens',
  eip155Label: 'Lens Chain Mainnet',
  logo: { light: lensLogo, dark: lensLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.LENS,
    name: 'GHO',
    symbol: 'GHO',
    logoUrl: GHO_MAINNET_LOGO_URL,
  },
  addressPrefix: 'lens',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1724216,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.lens.xyz'],
    },
  },
  color: '#FFFFFF',
  website: {
    name: 'Lens',
    url: 'https://www.lens.xyz',
  },
  docs: {
    name: 'Lens Docs',
    url: 'https://docs.lens.xyz',
  },
  blockExplorer: {
    name: 'Lens Explorer',
    url: 'https://explorer.lens.xyz',
    // Note: doesn't seem to be Etherscan derived. Will need to consider it in the code.
    // TODO: add a flag to indicate that the explorer is not Etherscan derived and handle it in the code.
  },
  bridges: [
    {
      name: 'Lens Bridge',
      url: 'https://lens.xyz/bridge',
    },
  ],
}
