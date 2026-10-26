import { EvmChainInfo, SupportedChainId } from '../types'
import { nativeCurrencyTemplate } from '../../constants/nativeCurrencyTemplate'
import { RAW_CHAINS_FILES_PATH } from '../../constants/paths'

const robinhoodLogo = `${RAW_CHAINS_FILES_PATH}/images/robinhood-logo.svg`

// See https://github.com/wevm/viem/blob/main/src/chains/definitions/robinhood.ts
// and https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-4663.json
export const robinhood: EvmChainInfo = {
  id: SupportedChainId.ROBINHOOD,
  internalId: 'robinhood',
  label: 'Robinhood Chain',
  eip155Label: 'Robinhood Chain',
  caip2Namespace: 'eip155',
  logo: { light: robinhoodLogo, dark: robinhoodLogo },
  nativeCurrency: {
    ...nativeCurrencyTemplate,
    chainId: SupportedChainId.ROBINHOOD,
  },
  addressPrefix: 'robinhoodchain',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
    },
  },
  color: '#ccff00', // Robin Neon, brand guidelines https://docs.robinhood.com/chain/brand-guidelines/
  website: {
    name: 'Robinhood Chain',
    url: 'https://robinhood.com/us/en/crypto/chain/',
  },
  docs: {
    name: 'Robinhood Chain Docs',
    url: 'https://docs.robinhood.com/chain',
  },
  blockExplorer: {
    name: 'Robinhood Chain Explorer',
    url: 'https://robin.etherscan.io',
  },
  bridges: [
    {
      name: 'Arbitrum Bridge',
      url: 'https://portal.arbitrum.io/bridge?destinationChain=robinhood-chain&sourceChain=ethereum',
    },
  ],
  isUnderDevelopment: true,
}
