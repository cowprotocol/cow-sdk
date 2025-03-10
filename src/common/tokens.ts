import { ChainId, SupportedChainId } from './chains'

/**
 * Token on a chain.
 */
export interface TokenInfo {
  chainId: ChainId
  address: string
  decimals: number

  name?: string
  symbol?: string
  logoUrl?: string
}

export const NATIVE_CURRENCY_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const ETH_LOGO_URL =
  'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png'

export const WRAPPED_NATIVE_CURRENCIES: Record<SupportedChainId, TokenInfo> = {
  [SupportedChainId.MAINNET]: {
    chainId: SupportedChainId.MAINNET,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    logoUrl: ETH_LOGO_URL,
  },

  [SupportedChainId.GNOSIS_CHAIN]: {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    decimals: 18,
    name: 'Wrapped XDAI',
    symbol: 'WXDAI',
    logoUrl:
      'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/100/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d/logo.png', // TODO: Add logo
  },

  [SupportedChainId.ARBITRUM_ONE]: {
    chainId: SupportedChainId.ARBITRUM_ONE,
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    decimals: 18,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    logoUrl: ETH_LOGO_URL,
  },

  [SupportedChainId.BASE]: {
    chainId: SupportedChainId.BASE,
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    logoUrl: ETH_LOGO_URL,
  },

  [SupportedChainId.SEPOLIA]: {
    chainId: SupportedChainId.BASE,
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    decimals: 18,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    logoUrl: ETH_LOGO_URL,
  },
}
