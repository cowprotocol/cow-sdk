import { ParaSwap } from 'paraswap'
import { NetworkID, RateOptions } from 'paraswap/build/types'
import { SupportedChainId } from '../../constants/chains'
import { WithDecimals } from '../../types'
import { PriceQuoteParams } from '../cow/types'

export type ParaswapLibMap = Map<NetworkID, ParaSwap>
export type QuoteOptions<T extends boolean> = {
  chainId?: SupportedChainId
  apiUrl?: string
  rateOptions?: RateOptions
  // bypasses null return when passed non-cow compatible chainId
  allowParaswapNetworks?: T
}
export type ParaswapOptions = RateOptions
export type ParaswapPriceQuoteParams = Omit<PriceQuoteParams, 'validTo'> &
  WithDecimals & { chainId: ParaswapCowswapNetworkID | NetworkID }
export type ParaswapCowswapNetworkID = 1
