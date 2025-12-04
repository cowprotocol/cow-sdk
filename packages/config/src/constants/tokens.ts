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
  [SupportedChainId.MAINNET]: getWrappedTokenForChain(
    SupportedChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    wrappedNativeCurrencyEth,
  ),
  [SupportedChainId.GNOSIS_CHAIN]: getWrappedTokenForChain(
    SupportedChainId.GNOSIS_CHAIN,
    '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    {
      decimals: 18,
      name: 'Wrapped XDAI',
      symbol: 'WXDAI',
    },
  ),
  [SupportedChainId.ARBITRUM_ONE]: getWrappedTokenForChain(
    SupportedChainId.ARBITRUM_ONE,
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    wrappedNativeCurrencyEth,
  ),
  [SupportedChainId.BASE]: getWrappedTokenForChain(
    SupportedChainId.BASE,
    '0x4200000000000000000000000000000000000006',
    wrappedNativeCurrencyEth,
  ),
  [SupportedChainId.SEPOLIA]: getWrappedTokenForChain(
    SupportedChainId.SEPOLIA,
    '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    wrappedNativeCurrencyEth,
  ),
  [SupportedChainId.POLYGON]: getWrappedTokenForChain(
    SupportedChainId.POLYGON,
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    {
      decimals: 18,
      name: 'Wrapped POL',
      symbol: 'WPOL',
    },
  ),
  [SupportedChainId.AVALANCHE]: getWrappedTokenForChain(
    SupportedChainId.AVALANCHE,
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    {
      decimals: 18,
      name: 'Wrapped AVAX',
      symbol: 'WAVAX',
    },
  ),
  [SupportedChainId.LENS]: getWrappedTokenForChain(
    SupportedChainId.LENS,
    '0x6bdc36e20d267ff0dd6097799f82e78907105e2f',
    {
      decimals: 18,
      name: 'Wrapped GHO',
      symbol: 'WGHO',
    },
  ),
  [SupportedChainId.BNB]: getWrappedTokenForChain(SupportedChainId.BNB, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', {
    decimals: 18,
    name: 'Wrapped BNB',
    symbol: 'WBNB',
  }),
  [SupportedChainId.PLASMA]: getWrappedTokenForChain(
    SupportedChainId.PLASMA,
    '0x6100e367285b01f48d07953803a2d8dca5d19873',
    {
      decimals: 18,
      name: 'Wrapped XPL',
      symbol: 'WXPL',
    },
  ),
  [SupportedChainId.LINEA]: getWrappedTokenForChain(
    SupportedChainId.LINEA,
    '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',
    wrappedNativeCurrencyEth,
  ),
}

function getWrappedTokenForChain(
  chainId: SupportedChainId,
  address: string,
  info: Pick<TokenInfo, 'decimals' | 'name' | 'symbol' | 'logoUrl'>,
): TokenInfo {
  const { logoUrl, ...rest } = info

  return {
    chainId,
    address,
    ...rest,
    logoUrl: logoUrl || `${TOKEN_LIST_IMAGES_PATH}/${chainId}/${address.toLowerCase()}/logo.png`,
  }
}

/**
 * Just a base template for the native currency, handy to define new networks.
 */
export const nativeCurrencyTemplate: Omit<TokenInfo, 'chainId'> = {
  address: NATIVE_CURRENCY_ADDRESS,
  decimals: 18,
  name: 'Ether',
  symbol: 'ETH',
  logoUrl: `${TOKEN_LIST_IMAGES_PATH}/1/${NATIVE_CURRENCY_ADDRESS.toLowerCase()}/logo.png`,
}
