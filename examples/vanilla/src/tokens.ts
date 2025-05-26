import { ETH_ADDRESS, SupportedChainId } from '../../../src'

class Token {
  constructor(
    public readonly chainId: SupportedChainId,
    public readonly address: string,
    public readonly decimals: number,
    public readonly symbol: string,
    public readonly name: string
  ) {}
}

export const TOKENS: Record<SupportedChainId, Token[]> = {
  [SupportedChainId.MAINNET]: [
    new Token(SupportedChainId.MAINNET, ETH_ADDRESS, 18, 'ETH', 'Ether'),
    new Token(SupportedChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
    new Token(SupportedChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC'),
    new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin'),
    new Token(SupportedChainId.MAINNET, '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB', 18, 'COW', 'CoW Protocol Token'),
  ],
  [SupportedChainId.GNOSIS_CHAIN]: [
    new Token(SupportedChainId.MAINNET, ETH_ADDRESS, 18, 'xDAI', 'xDAI'),
    new Token(SupportedChainId.GNOSIS_CHAIN, '0x4ECaBa5870353805a9F068101A40E0f32ed605C6', 6, 'USDT', 'Tether USD'),
    new Token(SupportedChainId.GNOSIS_CHAIN, '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252', 8, 'WBTC', 'Wrapped BTC'),
    new Token(SupportedChainId.GNOSIS_CHAIN, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USD Coin'),
    new Token(
      SupportedChainId.GNOSIS_CHAIN,
      '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
      18,
      'COW',
      'CoW Protocol Token'
    ),
  ],
  [SupportedChainId.ARBITRUM_ONE]: [
    new Token(SupportedChainId.ARBITRUM_ONE, ETH_ADDRESS, 18, 'ETH', 'Ether'),
    new Token(SupportedChainId.ARBITRUM_ONE, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6, 'USDT', 'Tether USD'),
    new Token(SupportedChainId.ARBITRUM_ONE, '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 8, 'WBTC', 'Wrapped BTC'),
    new Token(SupportedChainId.ARBITRUM_ONE, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 6, 'USDC', 'USD Coin'),
    new Token(
      SupportedChainId.ARBITRUM_ONE,
      '0xcb8b5cd20bdcaea9a010ac1f8d835824f5c87a04',
      18,
      'COW',
      'CoW Protocol Token'
    ),
  ],
  [SupportedChainId.SEPOLIA]: [
    new Token(SupportedChainId.SEPOLIA, ETH_ADDRESS, 18, 'ETH', 'Ether'),
    new Token(SupportedChainId.SEPOLIA, '0x58eb19ef91e8a6327fed391b51ae1887b833cc91', 6, 'USDT', 'Tether USD'),
    new Token(SupportedChainId.SEPOLIA, '0xd3f3d46FeBCD4CdAa2B83799b7A5CdcB69d135De', 18, 'GNO', 'GNO (test)'),
    new Token(SupportedChainId.SEPOLIA, '0xbe72E441BF55620febc26715db68d3494213D8Cb', 18, 'USDC', 'USDC (test)'),
    new Token(SupportedChainId.SEPOLIA, '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59', 18, 'COW', 'CoW Protocol Token'),
  ],
  [SupportedChainId.BASE]: [
    new Token(SupportedChainId.BASE, ETH_ADDRESS, 18, 'ETH', 'Ether'),
    new Token(SupportedChainId.BASE, '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', 6, 'USDT', 'Tether USD'),
    new Token(SupportedChainId.BASE, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6, 'USDC', 'USD Coin'),
    new Token(SupportedChainId.BASE, '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42', 6, 'EURC', 'EURC'),
  ],
  [SupportedChainId.AVALANCHE]: [
    new Token(SupportedChainId.POLYGON, ETH_ADDRESS, 18, 'AVAX', 'Avalanche'),
    new Token(SupportedChainId.POLYGON, '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', 6, 'USDT', 'Tether USD'),
    new Token(SupportedChainId.POLYGON, '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', 18, 'WAVAX', 'Wrapped AVAX'),
    new Token(SupportedChainId.POLYGON, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6, 'USDC', 'USD Coin'),
  ],
  [SupportedChainId.POLYGON]: [
    new Token(SupportedChainId.AVALANCHE, ETH_ADDRESS, 18, 'POL', 'POL  ex MATIC'),
    new Token(SupportedChainId.AVALANCHE, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 6, 'USDT', 'Tether USD'),
    new Token(SupportedChainId.AVALANCHE, '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', 18, 'WPOL', 'Wrapped POL'),
    new Token(SupportedChainId.AVALANCHE, '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', 6, 'USDC', 'USD Coin'),
    new Token(SupportedChainId.AVALANCHE, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'DAI', 'DAI Coin'),
  ],
}
