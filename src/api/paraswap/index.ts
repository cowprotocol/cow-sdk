import { OrderKind } from '@cowprotocol/contracts'
import { debug, error, warn } from 'loglevel'
import { ParaSwap, SwapSide } from 'paraswap'
import { OptimalRate } from 'paraswap-core'
import { NetworkID, RateOptions } from 'paraswap/build/types'
import { SupportedChainId } from '../../constants/chains'
import { CowError } from '../../utils/common'
import { getTokensFromMarket } from '../../utils/market'
import {
  API_NAME,
  BASE_URL,
  DEFAULT_RATE_OPTIONS,
  COMPATIBLE_PARASWAP_CHAINS_WITH_COW,
  LIB,
  LOG_PREFIX,
} from './constants'
import { ParaswapCowswapNetworkID, ParaswapLibMap, ParaswapPriceQuoteParams, QuoteOptions } from './types'
import { getParaswapChainId, getValidParams, handleResponse } from './utils'

const ALL_SUPPORTED_CHAIN_IDS = [SupportedChainId.MAINNET]

export default class ParaswapApi {
  libMap: ParaswapLibMap = LIB
  name: string
  apiUrl: string
  rateOptions: RateOptions

  constructor() {
    this.name = API_NAME
    this.apiUrl = BASE_URL
    this.rateOptions = DEFAULT_RATE_OPTIONS
  }

  public async getQuote(
    params: ParaswapPriceQuoteParams & { chainId: NetworkID },
    options?: Omit<QuoteOptions<true>, 'chainId'>
  ): Promise<OptimalRate | null>
  public async getQuote(
    params: ParaswapPriceQuoteParams & { chainId: ParaswapCowswapNetworkID },
    options?: Omit<QuoteOptions<false>, 'chainId'>
  ): Promise<OptimalRate | null>
  public async getQuote(
    params: ParaswapPriceQuoteParams,
    options: Omit<QuoteOptions<boolean>, 'chainId'> = { allowParaswapNetworks: false }
  ): Promise<OptimalRate | null> {
    const { chainId } = params
    const { baseToken, quoteToken, fromDecimals, toDecimals, amount, kind, userAddress } = getValidParams(
      params.chainId,
      params
    )

    const paraSwap = this.getLib(chainId, options?.apiUrl || this.apiUrl)
    if (!paraSwap) throw new CowError("ParaswapApi isn't compatible with chainId " + chainId)

    // Buy/sell token and side (sell/buy)
    const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })
    const swapSide = kind === OrderKind.BUY ? SwapSide.BUY : SwapSide.SELL

    // https://developers.paraswap.network/api/get-rate-for-a-token-pair
    const paraswapOptions: RateOptions = { ...this.rateOptions, ...options?.rateOptions }
    // block any non-cow compatible chains
    if (!options?.allowParaswapNetworks) {
      const isCompatibleChain = getParaswapChainId(chainId)
      if (!isCompatibleChain) {
        error(
          LOG_PREFIX,
          `Chain id ${chainId} is not currently supported by the CoW contracts - please use: ${COMPATIBLE_PARASWAP_CHAINS_WITH_COW.join(
            ','
          )}. If you want to query all other ParaSwap specific chain ids, please pass { allowParaswapNetworks: true } as the query's "options" parameter.`
        )

        // return a null price
        return null
      }
    }

    debug(LOG_PREFIX, 'Getting price quote', params)

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

    return handleResponse(rateResult)
  }

  public async getQuoteAllNetworks(
    params: ParaswapPriceQuoteParams & { chainId: NetworkID },
    options?: Omit<QuoteOptions<true>, 'chainId' | 'allowParaswapNetworks'>
  ) {
    return this.getQuote(params, { ...options, allowParaswapNetworks: true })
  }

  public async updateOptions(options: { apiUrl?: string; rateOptions?: RateOptions | null }) {
    // null resets rateOptions to empty
    if (options.rateOptions === null) {
      this.rateOptions = {}
    } else {
      this.rateOptions = {
        ...this.rateOptions,
        ...(options.rateOptions || {}),
      }
    }

    if (options.apiUrl) {
      this.apiUrl = options.apiUrl
    }
  }

  /* ----- PRIVATE ----- */
  private getLib(chainId: NetworkID, apiUrl: string): ParaSwap | null {
    let paraSwap = this.libMap.get(chainId)
    if (!paraSwap) {
      // get paraswap/cow's overlapping supported chains
      const networkId = getParaswapChainId(chainId)
      if (networkId == null) {
        warn(
          LOG_PREFIX,
          '- Unsupported network passed as quote fetch parameter. You passed:',
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
}
