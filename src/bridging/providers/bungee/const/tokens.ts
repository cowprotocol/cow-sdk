import { ETH_ADDRESS, TokenInfo } from 'src/common'
import { SupportedChainId, AdditionalTargetChainId, ChainId } from '../../../../chains/types'

/**
 * Chain config for Bungee. Includes all the supported tokens for the chain.
 */
export type BungeeChainConfig = Record<ChainId, Record<string, TokenInfo | undefined>>

// Bungee<>Cowswap integration is currently supporting Across and CCTP bridges so supports their major tokens
export const BUNGEE_CHAIN_TOKENS: BungeeChainConfig = {
  [SupportedChainId.MAINNET]: {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
      chainId: SupportedChainId.MAINNET,
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
      chainId: SupportedChainId.MAINNET,
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
      chainId: SupportedChainId.MAINNET,
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
    '0x6b175474e89094c44da98b954eedeac495271d0f': {
      chainId: SupportedChainId.MAINNET,
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    '0xdac17f958d2ee523a2206206994597c13d831ec7': {
      chainId: SupportedChainId.MAINNET,
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      name: 'Tether',
      symbol: 'USDT',
    },
    [ETH_ADDRESS.toLowerCase()]: {
      chainId: SupportedChainId.MAINNET,
      address: ETH_ADDRESS.toLowerCase(),
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
  },
  [SupportedChainId.POLYGON]: {
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': {
      chainId: SupportedChainId.POLYGON,
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
      name: 'USD Coin (Bridged)',
      symbol: 'USDC',
    },
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': {
      chainId: SupportedChainId.POLYGON,
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      decimals: 18,
      name: 'Wrapped Ether (Bridged)',
      symbol: 'WETH',
    },
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6': {
      chainId: SupportedChainId.POLYGON,
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      decimals: 8,
      name: 'Wrapped BTC (Bridged)',
      symbol: 'WBTC',
    },
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': {
      chainId: SupportedChainId.POLYGON,
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': {
      chainId: SupportedChainId.POLYGON,
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    [ETH_ADDRESS.toLowerCase()]: {
      chainId: SupportedChainId.POLYGON,
      address: ETH_ADDRESS.toLowerCase(),
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831': {
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': {
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': {
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      decimals: 8,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': {
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': {
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      decimals: 6,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    [ETH_ADDRESS.toLowerCase()]: {
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: ETH_ADDRESS.toLowerCase(),
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
  },
  [SupportedChainId.BASE]: {
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': {
      chainId: SupportedChainId.BASE,
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    '0x4200000000000000000000000000000000000006': {
      chainId: SupportedChainId.BASE,
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': {
      chainId: SupportedChainId.BASE,
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    [ETH_ADDRESS.toLowerCase()]: {
      chainId: SupportedChainId.BASE,
      address: ETH_ADDRESS.toLowerCase(),
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
  },
  [AdditionalTargetChainId.OPTIMISM]: {
    '0x0b2c639c533813f4aa9d7837caf62653d097ff85': {
      chainId: AdditionalTargetChainId.OPTIMISM,
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
    '0x4200000000000000000000000000000000000006': {
      chainId: AdditionalTargetChainId.OPTIMISM,
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
    },
    '0x68f180fcce6836688e9084f035309e29bf0a2095': {
      chainId: AdditionalTargetChainId.OPTIMISM,
      address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      decimals: 8,
      name: 'Wrapped BTC',
      symbol: 'WBTC',
    },
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': {
      chainId: AdditionalTargetChainId.OPTIMISM,
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': {
      chainId: AdditionalTargetChainId.OPTIMISM,
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      decimals: 6,
      name: 'Tether USD',
      symbol: 'USDT',
    },
    [ETH_ADDRESS.toLowerCase()]: {
      chainId: AdditionalTargetChainId.OPTIMISM,
      address: ETH_ADDRESS.toLowerCase(),
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
  },
}
