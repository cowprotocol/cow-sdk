import { SupportedChainId } from '../chains'
import { TokenInfo } from '../types/tokens'

export const NATIVE_CURRENCY_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const TOKEN_LIST_IMAGES_PATH = 'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images'

const wrappedNativeCurrencyEth = {
  decimals: 18,
  name: 'Wrapped Ether',
  symbol: 'WETH',
  logoUrl: `${TOKEN_LIST_IMAGES_PATH}/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png`,
}

export const WRAPPED_NATIVE_CURRENCIES: Record<SupportedChainId, TokenInfo> = {
  [SupportedChainId.MAINNET]: {
    ...wrappedNativeCurrencyEth,
    chainId: SupportedChainId.MAINNET,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },

  [SupportedChainId.GNOSIS_CHAIN]: {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    decimals: 18,
    name: 'Wrapped XDAI',
    symbol: 'WXDAI',
    logoUrl: `${TOKEN_LIST_IMAGES_PATH}/100/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d/logo.png`,
  },

  [SupportedChainId.ARBITRUM_ONE]: {
    ...wrappedNativeCurrencyEth,
    chainId: SupportedChainId.ARBITRUM_ONE,
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },

  [SupportedChainId.BASE]: {
    ...wrappedNativeCurrencyEth,
    chainId: SupportedChainId.BASE,
    address: '0x4200000000000000000000000000000000000006',
  },

  [SupportedChainId.SEPOLIA]: {
    ...wrappedNativeCurrencyEth,
    chainId: SupportedChainId.SEPOLIA,
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  },

  [SupportedChainId.POLYGON]: {
    chainId: SupportedChainId.POLYGON,
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    decimals: 18,
    name: 'Wrapped POL',
    symbol: 'WPOL',
    logoUrl: `${TOKEN_LIST_IMAGES_PATH}/137/0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270/logo.png`,
  },

  [SupportedChainId.AVALANCHE]: {
    chainId: SupportedChainId.AVALANCHE,
    address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    decimals: 18,
    name: 'Wrapped AVAX',
    symbol: 'WAVAX',
    logoUrl: `${TOKEN_LIST_IMAGES_PATH}/43114/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7/logo.png`,
  },
}

/**
 * Just a base template for the native currency, handy to define new networks.
 */
export const nativeCurrencyTemplate: Omit<TokenInfo, 'chainId'> = {
  address: NATIVE_CURRENCY_ADDRESS,
  decimals: 18,
  name: 'Ether',
  symbol: 'ETH',
  logoUrl: `${TOKEN_LIST_IMAGES_PATH}/1/${NATIVE_CURRENCY_ADDRESS}/logo.png`,
}
