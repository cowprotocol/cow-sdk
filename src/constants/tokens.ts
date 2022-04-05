import { SupportedChainId as ChainId } from './chains'
import { Token } from '../types'

export const XDAI_SYMBOL = 'XDAI'

export const WRAPPED_NATIVE_TOKEN: Record<ChainId, Token> = {
  [ChainId.MAINNET]: new Token('WETH', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
  [ChainId.RINKEBY]: new Token('WETH', '0xc778417E063141139Fce010982780140Aa0cD5Ab'),
  [ChainId.GNOSIS_CHAIN]: new Token('WXDAI', '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'),
}

export const NATIVE: Record<ChainId, string> = {
  [ChainId.MAINNET]: 'ETH',
  [ChainId.RINKEBY]: 'ETH',
  [ChainId.GNOSIS_CHAIN]: XDAI_SYMBOL,
}
