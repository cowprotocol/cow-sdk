import { ChainId } from '../chains'

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
