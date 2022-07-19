import { OrderKind } from '@cowprotocol/contracts'
import { log, warn } from 'loglevel'
import { ParaSwap } from 'paraswap'
import { APIError, RateOptions } from 'paraswap/build/types'
import { OptimalRate, SwapSide } from 'paraswap-core'
import { getTokensFromMarket } from '../../utils/market'
import { getParaswapChainId, getPriceQuoteFromError, getValidParams, isGetRateSuccess } from './utils'
import { ParaswapSupportedChainIds, ParaswapLibMap, QuoteOptions, ParaswapPriceQuoteParams } from './types'
import { SupportedChainId } from '../../constants/chains'
import { CowError } from '../../utils/common'

const logPrefix = 'ParaswapApi'
const ALL_SUPPORTED_CHAIN_IDS = [SupportedChainId.MAINNET]

class ParaswapBaseApi {
  libMap: ParaswapLibMap = new Map()
  name: string
  apiUrl: string

  constructor() {
    this.name = 'Paraswap'
    this.apiUrl = 'https://apiv5.paraswap.io'
  }

  static isValidChain(chainId: number): chainId is ParaswapSupportedChainIds {
    switch (chainId) {
      case SupportedChainId.MAINNET:
        return true
      default:
        return false
    }
  }

  protected getQuoter(chainId: SupportedChainId, apiUrl: string): ParaSwap | null {
    let paraSwap = this.libMap.get(chainId)
    if (!paraSwap) {
      // get paraswaps overlapping supported chains
      const networkId = getParaswapChainId(chainId)
      if (networkId == null) {
        warn(
          logPrefix,
          'Unsupported network passed as quote fetch parameter. You passed:',
          chainId,
          ' Supported networks:',
          ALL_SUPPORTED_CHAIN_IDS.join(',')
        )
        // Unsupported network
        return null
      }
      paraSwap = new ParaSwap(networkId, apiUrl)
      this.libMap.set(chainId, paraSwap)
    }

    return paraSwap
  }

  protected get DEFAULT_RATE_OPTIONS() {
    return {
      maxImpact: 100,
      excludeDEXS: 'ParaSwapPool4',
    }
  }
}

export class ParaswapApi extends ParaswapBaseApi {
  chainId: ParaswapSupportedChainIds

  private constructor(chainId: ParaswapSupportedChainIds) {
    super()
    this.chainId = chainId
  }

  static instantiate(chainId: number) {
    if (!ParaswapBaseApi.isValidChain(chainId)) {
      console.error(
        new CowError(
          logPrefix +
            ': Invalid chainId passed to constructor: ' +
            chainId.toString() +
            ' - instantiating as undefined.'
        )
      )

      return new ParaswapApiStatic()
    } else {
      return new ParaswapApi(chainId as ParaswapSupportedChainIds)
    }
  }

  async getQuote(params: ParaswapPriceQuoteParams, options?: QuoteOptions): Promise<OptimalRate | null> {
    const chainId = options?.chainId || this.chainId
    const { baseToken, quoteToken, fromDecimals, toDecimals, amount, kind, userAddress } = getValidParams(
      chainId,
      params
    )

    const paraSwap = this.getQuoter(chainId, options?.apiUrl || this.apiUrl)

    if (!paraSwap) throw new CowError('Invalid parameters')

    log(logPrefix, 'Get price quote', params)

    // Buy/sell token and side (sell/buy)
    const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })
    const swapSide = kind === OrderKind.BUY ? SwapSide.BUY : SwapSide.SELL

    // https://developers.paraswap.network/api/get-rate-for-a-token-pair
    const paraswapOptions: RateOptions = { ...this.DEFAULT_RATE_OPTIONS, ...options?.options }

    // Get price
    const rateResult = await paraSwap.getRate(
      sellToken,
      buyToken,
      amount,
      userAddress,
      swapSide,
      paraswapOptions,
      fromDecimals,
      toDecimals
    )

    console.debug(`
        =====================
        Rate Result: ${JSON.stringify(rateResult, null, 2)}
        =====================
    `)

    return _handleResponse(rateResult)
  }
}

export class ParaswapApiStatic extends ParaswapBaseApi {
  constructor() {
    super()
  }

  public static async getQuote(
    params: ParaswapPriceQuoteParams & { chainId: SupportedChainId },
    options?: Omit<QuoteOptions, 'chainId'>
  ): Promise<OptimalRate | null> {
    const { baseToken, quoteToken, fromDecimals, toDecimals, amount, kind, userAddress } = getValidParams(
      params.chainId,
      params
    )

    const paraSwap = this.getQuoter(chainId, options?.apiUrl || this.apiUrl)

    if (!paraSwap) throw new CowError('Invalid parameters')

    log(logPrefix, 'Get price quote', params)

    // Buy/sell token and side (sell/buy)
    const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })
    const swapSide = kind === OrderKind.BUY ? SwapSide.BUY : SwapSide.SELL

    // https://developers.paraswap.network/api/get-rate-for-a-token-pair
    const paraswapOptions: RateOptions = { ...this.DEFAULT_RATE_OPTIONS, ...options?.options }

    // Get price
    const rateResult = await paraSwap.getRate(
      sellToken,
      buyToken,
      amount,
      userAddress,
      swapSide,
      paraswapOptions,
      fromDecimals,
      toDecimals
    )

    console.debug(`
        =====================
        Rate Result: ${JSON.stringify(rateResult, null, 2)}
        =====================
    `)

    return _handleResponse(rateResult)
  }
}

function _handleResponse(rateResult: OptimalRate | APIError) {
  if (isGetRateSuccess(rateResult)) {
    // Success getting the price
    return rateResult
  } else {
    // Error getting the price
    const priceQuote = getPriceQuoteFromError(rateResult)
    if (priceQuote) {
      return priceQuote
    } else {
      throw rateResult
    }
  }
}
