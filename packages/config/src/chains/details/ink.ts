import { ChainInfo, SupportedEvmChainId } from '../types'
import { nativeCurrencyTemplate } from '../../constants/tokens'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

const inkLogo = `${RAW_CHAINS_FILES_PATH}/images/ink-logo.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/ink.ts
// and https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-57073.json
export const ink: ChainInfo = {
  id: SupportedEvmChainId.INK,
  label: 'Ink',
  eip155Label: 'Ink Chain Mainnet',
  logo: { light: inkLogo, dark: inkLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedEvmChainId.INK,
  },
  addressPrefix: 'ink',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-ten.inkonchain.com'],
    },
  },
  color: '#7132f5', // Brand assets https://docs.inkonchain.com/work-with-ink/brand-kit
  website: {
    name: 'Ink',
    url: 'https://inkonchain.com/',
  },
  docs: {
    name: 'Ink Docs',
    url: 'https://docs.inkonchain.com',
  },
  blockExplorer: {
    name: 'Ink Explorer',
    url: 'https://explorer.inkonchain.com',
    // Note: doesn't seem to be Etherscan derived. Will need to consider it in the code.
    // TODO: add a flag to indicate that the explorer is not Etherscan derived and handle it in the code..
  },
  bridges: [
    {
      name: 'Ink Bridge',
      url: 'https://inkonchain.com/bridge',
    },
  ],
  isUnderDevelopment: true,
}
