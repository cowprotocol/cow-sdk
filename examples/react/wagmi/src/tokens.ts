import { SupportedChainId, TokenInfo } from '@cowprotocol/cow-sdk'

export const USDC_TOKENS: Record<SupportedChainId, TokenInfo> = {
  [SupportedChainId.MAINNET]: {
    chainId: SupportedChainId.MAINNET,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC (Ethereum)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.BNB]: {
    chainId: SupportedChainId.BNB,
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC (BNB Chain)
    decimals: 18,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    chainId: SupportedChainId.GNOSIS_CHAIN,
    address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC (Bridged from Ethereum)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.POLYGON]: {
    chainId: SupportedChainId.POLYGON,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC.e (Bridged from Ethereum)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.LENS]: {
    chainId: SupportedChainId.LENS,
    address: '0x88F08E304EC4f90D644Cec3Fb69b8aD414acf884', // USDC (Native on Lens)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.BASE]: {
    chainId: SupportedChainId.BASE,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bDa02913', // USDC (Native on Base)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    chainId: SupportedChainId.ARBITRUM_ONE,
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC (Native Arbitrum)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.AVALANCHE]: {
    chainId: SupportedChainId.AVALANCHE,
    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC (Native Avalanche)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.LINEA]: {
    chainId: SupportedChainId.LINEA,
    address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // USDC (Native Linea)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.PLASMA]: {
    // TODO: This is USDT, not USDC!!! Update if/when there's a USDC deployment on Plasma
    chainId: SupportedChainId.PLASMA,
    address: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb', // USDT (Native Plasma)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  [SupportedChainId.SEPOLIA]: {
    chainId: SupportedChainId.SEPOLIA,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC (Sepolia testnet deployment by Circle)
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
}
