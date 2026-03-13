import { SupportedChainId } from '../chains/types'
import { TokenInfo } from '../types/tokens'
import { TOKEN_LIST_IMAGES_PATH } from './paths'

const wrappedNativeCurrencyEth = {
  decimals: 18,
  name: 'Wrapped Ether',
  symbol: 'WETH',
  logoUrl: `${TOKEN_LIST_IMAGES_PATH}/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png`,
}

export const WRAPPED_NATIVE_CURRENCIES: Record<SupportedChainId, TokenInfo> = {
  [SupportedChainId.MAINNET]: createWrappedTokenForChain(
    SupportedChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    wrappedNativeCurrencyEth,
  ),
  [SupportedChainId.GNOSIS_CHAIN]: createWrappedTokenForChain(
    SupportedChainId.GNOSIS_CHAIN,
    '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    {
      decimals: 18,
      name: 'Wrapped XDAI',
      symbol: 'WXDAI',
    },
  ),
  [SupportedChainId.ARBITRUM_ONE]: createWrappedTokenForChain(
    SupportedChainId.ARBITRUM_ONE,
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    wrappedNativeCurrencyEth,
  ),
  [SupportedChainId.BASE]: createWrappedTokenForChain(
    SupportedChainId.BASE,
    '0x4200000000000000000000000000000000000006',
    wrappedNativeCurrencyEth,
  ),
  [SupportedChainId.SEPOLIA]: createWrappedTokenForChain(
    SupportedChainId.SEPOLIA,
    '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    wrappedNativeCurrencyEth,
  ),
  [SupportedChainId.POLYGON]: createWrappedTokenForChain(
    SupportedChainId.POLYGON,
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    {
      decimals: 18,
      name: 'Wrapped POL',
      symbol: 'WPOL',
    },
  ),
  [SupportedChainId.AVALANCHE]: createWrappedTokenForChain(
    SupportedChainId.AVALANCHE,
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    {
      decimals: 18,
      name: 'Wrapped AVAX',
      symbol: 'WAVAX',
    },
  ),
  [SupportedChainId.BNB]: createWrappedTokenForChain(SupportedChainId.BNB, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', {
    decimals: 18,
    name: 'Wrapped BNB',
    symbol: 'WBNB',
  }),
  [SupportedChainId.PLASMA]: createWrappedTokenForChain(
    SupportedChainId.PLASMA,
    '0x6100e367285b01f48d07953803a2d8dca5d19873',
    {
      decimals: 18,
      name: 'Wrapped XPL',
      symbol: 'WXPL',
    },
  ),
  [SupportedChainId.LINEA]: createWrappedTokenForChain(
    SupportedChainId.LINEA,
    '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',
    wrappedNativeCurrencyEth,
  ),
  [SupportedChainId.INK]: createWrappedTokenForChain(
    SupportedChainId.INK,
    '0x4200000000000000000000000000000000000006',
    wrappedNativeCurrencyEth,
  ),
}

function createWrappedTokenForChain(
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

export function getWrappedTokenForChain(chainId: SupportedChainId): TokenInfo | undefined {
  return WRAPPED_NATIVE_CURRENCIES[chainId]
}
