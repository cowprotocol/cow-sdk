import { SupportedEvmChainId, TokenInfo } from '@cowprotocol/cow-sdk'

export const USDC_TOKENS: Record<SupportedEvmChainId, TokenInfo> = {
  [SupportedEvmChainId.MAINNET]: {
    chainId: SupportedEvmChainId.MAINNET,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC (Ethereum)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.BNB]: {
    chainId: SupportedEvmChainId.BNB,
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC (BNB Chain)
    decimals: 18,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.GNOSIS_CHAIN]: {
    chainId: SupportedEvmChainId.GNOSIS_CHAIN,
    address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC (Bridged from Ethereum)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.POLYGON]: {
    chainId: SupportedEvmChainId.POLYGON,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC.e (Bridged from Ethereum)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.LENS]: {
    chainId: SupportedEvmChainId.LENS,
    address: '0x88F08E304EC4f90D644Cec3Fb69b8aD414acf884', // USDC (Native on Lens)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.BASE]: {
    chainId: SupportedEvmChainId.BASE,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bDa02913', // USDC (Native on Base)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.ARBITRUM_ONE]: {
    chainId: SupportedEvmChainId.ARBITRUM_ONE,
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC (Native Arbitrum)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.AVALANCHE]: {
    chainId: SupportedEvmChainId.AVALANCHE,
    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC (Native Avalanche)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.LINEA]: {
    chainId: SupportedEvmChainId.LINEA,
    address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // USDC (Native Linea)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.PLASMA]: {
    // TODO: This is USDT, not USDC!!! Update if/when there's a USDC deployment on Plasma
    chainId: SupportedEvmChainId.PLASMA,
    address: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USDT (Native Plasma)
    decimals: 6,
    name: 'USDT',
    symbol: 'USDT',
  },
  [SupportedEvmChainId.INK]: {
    chainId: SupportedEvmChainId.INK,
    address: '0x2D270e6886d130D724215A266106e6832161EAEd', // USDC (Native Ink)
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  },
  [SupportedEvmChainId.SEPOLIA]: {
    chainId: SupportedEvmChainId.SEPOLIA,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC (Sepolia testnet deployment by Circle)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
}
