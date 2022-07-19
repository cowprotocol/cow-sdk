import { ParaSwap } from 'paraswap'
import { RateOptions } from 'paraswap/build/types'
import { SupportedChainId } from '../../constants/chains'
import { PriceQuoteParams } from '../cow/types'

// current support for Mainnet - 1, Ropsten - 3, Polygon - 56, BSC - 137
// https://app.swaggerhub.com/apis/paraswapv5/api/1.0#/tokens/get_tokens__network_
export type ParaswapSupportedChainIds = 1 | 3 | 56 | 137
export type ParaswapLibMap = Map<number, ParaSwap>
export type QuoteOptions = {
  chainId?: SupportedChainId
  apiUrl?: string
  options?: RateOptions
}
export type ParaswapPriceQuoteParams = PriceQuoteParams & {
  fromDecimals: number
  toDecimals: number
}
