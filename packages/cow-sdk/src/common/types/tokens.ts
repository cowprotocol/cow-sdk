import { ChainId } from '../../chains/types'

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
