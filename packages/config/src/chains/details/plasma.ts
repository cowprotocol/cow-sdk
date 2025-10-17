import { ChainInfo, SupportedChainId } from '../types'
import { nativeCurrencyTemplate, RAW_CHAINS_FILES_PATH } from '../../constants'

const light = `${RAW_CHAINS_FILES_PATH}/images/plasma-logo.svg`
const dark = light

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/plasma.ts
// and https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-9745.json
export const plasma: ChainInfo = {
  id: SupportedChainId.PLASMA,
  label: 'Plasma',
  eip155Label: 'Plasma Mainnet',
  logo: { light, dark },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.PLASMA,
    name: 'Plasma',
    symbol: 'XPL',
    logoUrl: '', //TODO: add plasma token image
  },
  addressPrefix: 'plasma',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.plasma.to'],
    },
  },
  color: '#569F8C', // brand kit https://www.plasma.to/brand
  website: {
    name: 'Plasma',
    url: 'https://www.plasma.to/',
  },
  docs: {
    name: 'Plasma Docs',
    url: 'https://docs.plasma.to/',
  },
  blockExplorer: {
    name: 'PlasmaScan',
    url: 'https://plasmascan.to/',
  },
  // No native bridge available AFAICT
  // bridges: [
  //   {
  //     name: 'Plasma Bridge',
  //     url: '',
  //   },
  // ],
  isUnderDevelopment: true, // TODO: Remove when ready for production
}
