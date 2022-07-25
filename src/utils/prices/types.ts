import { OptimalRate } from 'paraswap-core'
import { ZeroXQuote } from '../../api/0x/types'
import { PriceQuoteParams, WithDecimals, WithChainId, PriceInformation, FeeInformation } from '../../types'

export interface GetBestPriceOptions {
  aggrOverride?: 'max' | 'min'
}
export type CompatibleQuoteParams = PriceQuoteParams & WithDecimals & WithChainId
export type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<FeeInformation>]
export type AllPricesResult = {
  cowQuoteResult: PromiseSettledResult<PriceInformation | null>
  paraswapQuoteResult: PromiseSettledResult<OptimalRate | null>
  zeroXQuoteResult: PromiseSettledResult<ZeroXQuote | null>
}
export type PriceSource = 'cow-protocol' | 'paraswap' | '0x'

export type PriceInformationWithSource = PriceInformation & { source: PriceSource; data?: unknown }
export type PromiseRejectedResultWithSource = PromiseRejectedResult & { source: PriceSource }
export type FilterWinningPriceParams = {
  kind: string
  amounts: string[]
  priceQuotes: PriceInformationWithSource[]
} & GetBestPriceOptions
