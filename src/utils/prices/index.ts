/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import CowSdk from '../../CowSdk'
import { BigNumber } from 'ethers'
import BigNumberJs from 'bignumber.js'
// common
import { SupportedChainId } from '../../constants/chains'
import { isPromiseFulfilled, logPrefix as cowLogPrefix, withTimeout } from '../common'
import { getCanonicalMarket } from '../market'
import { OrderKind, PriceInformation, PriceQuoteParams, QuoteParams, SimpleGetQuoteResponse } from '../../types'
// paraswap
import { OptimalRate } from 'paraswap-core'
import { LOG_PREFIX as paraswapLogPrefix } from '../../api/paraswap/constants'
import { getParaswapChainId, normaliseQuoteResponse as normaliseQuoteResponseParaswap } from '../../api/paraswap/utils'
// 0x
import { ZeroXQuote } from '../../api/0x/types'
// TODO: move this to constants
import { logPrefix as zeroXLogPrefix } from '../../api/0x/error'
import { normaliseQuoteResponse as normaliseQuoteResponse0x } from '../../api/0x/utils'
import GpQuoteError, { GpQuoteErrorCodes } from '../../api/cow/errors/QuoteError'
import { NetworkID } from 'paraswap'
import {
  AllPricesResult,
  CompatibleQuoteParams,
  FilterWinningPriceParams,
  GetBestPriceOptions,
  PriceInformationWithSource,
  PromiseRejectedResultWithSource,
  QuoteResult,
} from './types'

// TODO: review and move
const PRICE_API_TIMEOUT_MS = 15000

export async function getAllPricesLegacy(
  cowSdk: CowSdk<SupportedChainId>,
  params: CompatibleQuoteParams
): Promise<AllPricesResult> {
  const { cowApi, zeroXApi, paraswapApi } = cowSdk

  // Get price from all API: CoW legacy, Paraswap, 0x
  const cowQuotePromise = withTimeout(
    cowApi.getPriceQuoteLegacy(params),
    PRICE_API_TIMEOUT_MS,
    cowLogPrefix + ': Get quote'
  )

  const isParaswapEnabled = Boolean(paraswapApi && getParaswapChainId(params.chainId))
  const paraswapQuotePromise = isParaswapEnabled
    ? withTimeout(
        cowSdk.paraswapApi!.getQuote({ ...params, chainId: params.chainId as NetworkID }),
        PRICE_API_TIMEOUT_MS,
        paraswapLogPrefix + ': Get quote'
      )
    : null

  const is0xEnabled = !!zeroXApi
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

export async function getBestPriceLegacy(
  cowSdk: CowSdk<SupportedChainId>,
  params: CompatibleQuoteParams,
  options?: GetBestPriceOptions
): Promise<PriceInformation> {
  // Get all prices
  const { cowQuoteResult, paraswapQuoteResult, zeroXQuoteResult } = await getAllPricesLegacy(cowSdk, params)

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
    console.error('[utils::getBestPriceLegacy] Some API failed or timed out: ' + sourceNames, errorsGetPrice)
  }

  if (priceQuotes.length > 0) {
    // At least we have one successful price
    const sourceNames = priceQuotes.map((p) => p.source).join(', ')
    console.log('[utils::getBestPriceLegacy] Get best price succeeded for ' + sourceNames, priceQuotes)
    const amounts = priceQuotes.map((quote) => quote.amount).filter(Boolean) as string[]

    return _filterWinningPrice({ ...options, kind: params.kind, amounts, priceQuotes })
  } else {
    // It was not possible to get a price estimation
    const priceQuoteError = new PriceQuoteErrorLegacy('Error querying price from APIs', params, [
      cowQuoteResult,
      paraswapQuoteResult,
      zeroXQuoteResult,
    ])

    throw priceQuoteError
  }
}

export async function getBestQuoteLegacy(
  cowSdk: CowSdk<SupportedChainId>,
  { quoteParams, fetchFee, previousFee }: Omit<QuoteParams, 'strategy'> & { quoteParams: CompatibleQuoteParams }
): Promise<QuoteResult> {
  const { sellToken, buyToken, amount, kind } = quoteParams
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

    feeExceedsPrice = result.lte('0')

    exchangeAmount = !feeExceedsPrice ? result.toString() : null
  } else {
    // For buy orders, we swap the whole amount, then we add the fee on top
    exchangeAmount = amount
  }

  // Get price for price estimation
  const pricePromise =
    !feeExceedsPrice && exchangeAmount
      ? getBestPriceLegacy(cowSdk, { ...quoteParams, baseToken, quoteToken, amount: exchangeAmount })
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
  matchaPriceResult: PromiseSettledResult<ZeroXQuote | null>
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

const FEE_EXCEEDS_FROM_ERROR = new GpQuoteError({
  errorType: GpQuoteErrorCodes.FeeExceedsFrom,
  description: GpQuoteError.quoteErrorDetails.FeeExceedsFrom,
})

class PriceQuoteErrorLegacy extends Error {
  params: PriceQuoteParams
  results: PromiseSettledResult<unknown>[]

  constructor(message: string, params: PriceQuoteParams, results: PromiseSettledResult<any>[]) {
    super(message)
    this.params = params
    this.results = results
  }
}

function _errorHasProperty<T extends object>(data: unknown, prop: string): data is T {
  if (typeof data === 'object' && data) {
    return prop in data
  } else {
    return false
  }
}

function _checkFeeErrorForData(error: GpQuoteError) {
  console.warn('[getBestQuote]::Fee error', error)
  let feeAmount
  if (_errorHasProperty<{ fee_amount: string }>(error?.data, 'fee_amount')) {
    feeAmount = error.data.fee_amount
  } else if (_errorHasProperty<{ feeAmount: string }>(error?.data, 'feeAmount')) {
    feeAmount = error.data.feeAmount
  }

  const feeExpiration = _errorHasProperty<{ expiration: SimpleGetQuoteResponse['expiration'] }>(
    error.data,
    'expiration'
  )
    ? error.data.expiration
    : undefined
  // check if our error response has any fee data attached to it
  if (feeAmount && feeExpiration) {
    return {
      amount: feeAmount,
      expirationDate: feeExpiration,
    }
  } else {
    // no data object, just rethrow
    throw error
  }
}
