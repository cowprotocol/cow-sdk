/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import CowSdk from '../CowSdk'
import { BigNumber } from 'ethers'
import BigNumberJs from 'bignumber.js'
// common
import { SupportedChainId } from '../constants/chains'
import { isPromiseFulfilled, logPrefix as cowLogPrefix, withTimeout } from './common'
import { getCanonicalMarket } from './market'
import {
  FeeInformation,
  OrderKind,
  PriceInformation,
  PriceQuoteParams,
  QuoteParams,
  WithChainId,
  WithDecimals,
} from '../types'
// paraswap
import { OptimalRate } from 'paraswap-core'
import { LOG_PREFIX as paraswapLogPrefix } from '../api/paraswap/constants'
import { normaliseQuoteResponse as normaliseQuoteResponseParaswap } from '../api/paraswap/utils'
// 0x
import { MatchaPriceQuote } from '../api/0x/types'
// TODO: move this to constants
import { logPrefix as zeroXLogPrefix } from '../api/0x/error'
import { normaliseQuoteResponse as normaliseQuoteResponse0x } from '../api/0x/utils'
import GpQuoteError, { GpQuoteErrorCodes } from '../api/cow/errors/QuoteError'

interface GetBestPriceOptions {
  aggrOverride?: 'max' | 'min'
}
type CompatibleQuoteParams = PriceQuoteParams & WithDecimals & WithChainId
type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<FeeInformation>]
type AllPricesResult = {
  cowQuoteResult: PromiseSettledResult<PriceInformation | null>
  paraswapQuoteResult: PromiseSettledResult<OptimalRate | null>
  zeroXQuoteResult: PromiseSettledResult<MatchaPriceQuote | null>
}
type PriceSource = 'cow-protocol' | 'paraswap' | '0x'

type PriceInformationWithSource = PriceInformation & { source: PriceSource; data?: any }
type PromiseRejectedResultWithSource = PromiseRejectedResult & { source: PriceSource }
type FilterWinningPriceParams = {
  kind: string
  amounts: string[]
  priceQuotes: PriceInformationWithSource[]
} & GetBestPriceOptions

// TODO: review and move
const PRICE_API_TIMEOUT_MS = 15000

export async function getAllPrices(
  cowSdk: CowSdk<SupportedChainId>,
  params: CompatibleQuoteParams
): Promise<AllPricesResult> {
  const { cowApi, zeroXApi, paraswapApi } = cowSdk

  const is0xEnabled = !!zeroXApi
  const isParaswapEnabled = !!paraswapApi

  // Get price from all API: Gpv2, Paraswap, Matcha (0x)
  const cowQuotePromise = withTimeout(
    cowApi.getPriceQuoteLegacy(params),
    PRICE_API_TIMEOUT_MS,
    cowLogPrefix + ': Get quote'
  )

  const paraswapQuotePromise = isParaswapEnabled
    ? withTimeout(cowSdk.paraswapApi!.getQuote(params), PRICE_API_TIMEOUT_MS, paraswapLogPrefix + ': Get quote')
    : null

  const zeroXQuotePromise = is0xEnabled
    ? withTimeout(cowSdk.zeroXApi!.getQuote(params), PRICE_API_TIMEOUT_MS, zeroXLogPrefix + ': Get quote')
    : null

  // Get results from API queries
  const [cowQuote, paraswapQuote, zeroXQuote] = await Promise.allSettled([
    cowQuotePromise,
    paraswapQuotePromise,
    zeroXQuotePromise,
  ])

  return {
    cowQuoteResult: cowQuote,
    paraswapQuoteResult: paraswapQuote,
    zeroXQuoteResult: zeroXQuote,
  }
}

export async function getBestPrice(
  cowSdk: CowSdk<SupportedChainId>,
  params: CompatibleQuoteParams,
  options?: GetBestPriceOptions
): Promise<PriceInformation> {
  // Get all prices
  const { cowQuoteResult, paraswapQuoteResult, zeroXQuoteResult } = await getAllPrices(cowSdk, params)

  // Aggregate successful and error prices
  const [priceQuotes, errorsGetPrice] = _extractPriceAndErrorPromiseValues(
    // we pass the kind of trade here as matcha doesn't have an easy way to differentiate
    params.kind,
    cowQuoteResult,
    paraswapQuoteResult,
    zeroXQuoteResult
  )

  // Print prices who failed to be fetched
  if (errorsGetPrice.length > 0) {
    const sourceNames = errorsGetPrice.map((e) => e.source).join(', ')
    console.error('[utils::useRefetchPriceCallback] Some API failed or timed out: ' + sourceNames, errorsGetPrice)
  }

  if (priceQuotes.length > 0) {
    // At least we have one successful price
    const sourceNames = priceQuotes.map((p) => p.source).join(', ')
    console.log('[utils::useRefetchPriceCallback] Get best price succeeded for ' + sourceNames, priceQuotes)
    const amounts = priceQuotes.map((quote) => quote.amount).filter(Boolean) as string[]

    return _filterWinningPrice({ ...options, kind: params.kind, amounts, priceQuotes })
  } else {
    // It was not possible to get a price estimation
    const priceQuoteError = new PriceQuoteError('Error querying price from APIs', params, [
      cowQuoteResult,
      paraswapQuoteResult,
      zeroXQuoteResult,
    ])

    throw priceQuoteError
  }
}

export async function getBestQuote(
  cowSdk: CowSdk<SupportedChainId>,
  { quoteParams, fetchFee, previousFee }: Omit<QuoteParams, 'strategy'> & { quoteParams: CompatibleQuoteParams }
): Promise<QuoteResult> {
  const { sellToken, buyToken, fromDecimals, toDecimals, amount, kind, userAddress, validTo } = quoteParams
  const { baseToken, quoteToken } = getCanonicalMarket({ sellToken, buyToken, kind })
  // Get a new fee quote (if required)
  const feePromise =
    fetchFee || !previousFee
      ? cowSdk.cowApi
          .getQuote(quoteParams)
          .then((resp) => ({ amount: resp.quote.feeAmount, expirationDate: resp.expiration }))
          .catch(_checkFeeErrorForData)
      : Promise.resolve(previousFee)

  // Get a new price quote
  let exchangeAmount
  let feeExceedsPrice = false
  if (kind === 'sell') {
    // Sell orders need to deduct the fee from the swapped amount
    // we need to check for 0/negative exchangeAmount should fee >= amount
    const { amount: fee } = await feePromise
    const result = BigNumber.from(amount).sub(fee)
    console.log(`Sell amount before fee: ${_formatAtoms(amount, fromDecimals)}  (in atoms ${amount})`)
    console.log(`Sell amount after fee: ${_formatAtoms(result.toString(), fromDecimals)}  (in atoms ${result})`)

    feeExceedsPrice = result.lte('0')

    exchangeAmount = !feeExceedsPrice ? result.toString() : null
  } else {
    // For buy orders, we swap the whole amount, then we add the fee on top
    exchangeAmount = amount
  }

  // Get price for price estimation
  const pricePromise =
    !feeExceedsPrice && exchangeAmount
      ? getBestPrice(cowSdk, { ...quoteParams, baseToken, quoteToken, amount: exchangeAmount })
      : // fee exceeds our price, is invalid
        Promise.reject(FEE_EXCEEDS_FROM_ERROR)

  return Promise.allSettled([pricePromise, feePromise])
}

/**
 * Auxiliary function that would take the settled results from all price feeds (resolved/rejected), and group them by
 * successful price quotes and errors price quotes. For each price, it also give the context (the name of the price feed)
 */
function _extractPriceAndErrorPromiseValues(
  // we pass the kind of trade here as matcha doesn't have an easy way to differentiate
  kind: OrderKind,
  gpPriceResult: PromiseSettledResult<PriceInformation | null>,
  paraswapQuoteResult: PromiseSettledResult<OptimalRate | null>,
  matchaPriceResult: PromiseSettledResult<MatchaPriceQuote | null>
): [Array<PriceInformationWithSource>, Array<PromiseRejectedResultWithSource>] {
  // Prepare an array with all successful estimations
  const priceQuotes: Array<PriceInformationWithSource> = []
  const errorsGetPrice: Array<PromiseRejectedResultWithSource> = []

  if (isPromiseFulfilled(gpPriceResult)) {
    const gpPrice = gpPriceResult.value
    if (gpPrice) {
      priceQuotes.push({ ...gpPrice, source: 'cow-protocol' })
    }
  } else {
    errorsGetPrice.push({ ...gpPriceResult, source: 'cow-protocol' })
  }

  if (isPromiseFulfilled(paraswapQuoteResult)) {
    const paraswapPrice = normaliseQuoteResponseParaswap(paraswapQuoteResult.value)
    if (paraswapPrice) {
      priceQuotes.push({ ...paraswapPrice, source: 'paraswap', data: paraswapQuoteResult.value })
    }
  } else {
    errorsGetPrice.push({ ...paraswapQuoteResult, source: 'paraswap' })
  }

  if (isPromiseFulfilled(matchaPriceResult)) {
    const matchaPrice = normaliseQuoteResponse0x(matchaPriceResult.value, kind)
    if (matchaPrice) {
      priceQuotes.push({ ...matchaPrice, source: '0x', data: matchaPriceResult.value })
    }
  } else {
    errorsGetPrice.push({ ...matchaPriceResult, source: '0x' })
  }

  return [priceQuotes, errorsGetPrice]
}

function _filterWinningPrice(params: FilterWinningPriceParams) {
  // Take the best price: Aggregate all the amounts into a single one.
  //  - Use maximum of all the result for "Sell orders":
  //        You want to get the maximum number of buy tokens
  //  - Use minimum "Buy orders":
  //        You want to spend the min number of sell tokens
  const aggregationFunction = params.aggrOverride || params.kind === OrderKind.SELL ? 'max' : 'min'
  const amount = BigNumberJs[aggregationFunction](...params.amounts).toString(10)
  const token = params.priceQuotes[0].token

  const winningPrices = params.priceQuotes
    .filter((quote) => quote.amount === amount)
    .map((p) => p.source)
    .join(', ')
  console.debug('[util::filterWinningPrice] Winning price: ' + winningPrices + ' for token ' + token + ' @', amount)

  return { token, amount }
}

const TEN = new BigNumberJs(10)
function _formatAtoms(amount: string, decimals: number): string {
  return new BigNumberJs(amount).div(TEN.pow(decimals)).toString(10)
}

const FEE_EXCEEDS_FROM_ERROR = new GpQuoteError({
  errorType: GpQuoteErrorCodes.FeeExceedsFrom,
  description: GpQuoteError.quoteErrorDetails.FeeExceedsFrom,
})

class PriceQuoteError extends Error {
  params: PriceQuoteParams
  results: PromiseSettledResult<any>[]

  constructor(message: string, params: PriceQuoteParams, results: PromiseSettledResult<any>[]) {
    super(message)
    this.params = params
    this.results = results
  }
}

function _checkFeeErrorForData(error: GpQuoteError) {
  console.warn('[getBestQuote]::Fee error', error)

  const feeAmount = (error?.data as any)?.fee_amount || (error?.data as any)?.feeAmount
  const feeExpiration = (error?.data as any)?.expiration
  // check if our error response has any fee data attached to it
  if (feeAmount) {
    return {
      amount: feeAmount,
      expirationDate: feeExpiration,
    }
  } else {
    // no data object, just rethrow
    throw error
  }
}
