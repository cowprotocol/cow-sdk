/**
 * Chain config for Across. Includes all the supported tokens for the chain.
 */
export interface AcrossChainConfig {
  chainId: number
  usdc: string
  weth?: string
  wbtc?: string
  dai?: string
  usdt?: string
  uma?: string
}

export enum AcrossSupportedChainId {
  MAINNET = 1,
  GNOSIS_CHAIN = 100,
  ARBITRUM_ONE = 42161,
  BASE = 8453,
  SEPOLIA = 11155111,
}

/**
 * This is a mapping to help implementing a very basic intermediate token selection algorithm.
 *
 * It will be used to connect one token to another token in a different chain by symbol
 */
export const chainIdMap: Record<string, AcrossChainConfig> = {
  Ethereum: {
    chainId: 1,
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    wbtc: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  Polygon: {
    chainId: 137,
    usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    weth: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    wbtc: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    dai: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  Arbitrum: {
    chainId: 42161,
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    wbtc: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    dai: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  Base: {
    chainId: 8453,
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    weth: '0x4200000000000000000000000000000000000006',
    wbtc: undefined,
    dai: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    usdt: undefined,
  },
  Optimism: {
    chainId: 10,
    usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    weth: '0x4200000000000000000000000000000000000006',
    wbtc: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    dai: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    usdt: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  },
} as const

export function getChainNameById(chainId: number): string | undefined {
  return Object.entries(chainIdMap).find(([, config]) => config.chainId === chainId)?.[0]
}
