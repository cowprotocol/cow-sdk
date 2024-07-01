import { AppDataInfo, SwapAdvancedSettings, SwapParameters } from './types'
import { DEFAULT_QUOTE_VALIDITY, log } from './consts'
import { ethers } from 'ethers'
import {
  getQuoteAmountsAndCosts,
  OrderBookApi,
  OrderQuoteRequest,
  OrderQuoteResponse,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  QuoteAmountsAndCosts,
  SigningScheme,
} from '../order-book'
import { buildAppData } from './appDataUtils'

export interface GetQuoteResult {
  amountsAndCosts: QuoteAmountsAndCosts
  quoteResponse: OrderQuoteResponse
  appDataInfo: AppDataInfo
  orderBookApi: OrderBookApi
  signer: ethers.Signer
}

export async function getQuote(
  params: SwapParameters,
  advancedSettings?: SwapAdvancedSettings
): Promise<GetQuoteResult> {
  const {
    appCode,
    chainId,
    sellToken,
    sellTokenDecimals,
    buyToken,
    buyTokenDecimals,
    amount,
    kind,
    partnerFee,
    validFor = DEFAULT_QUOTE_VALIDITY,
    slippageBps = 0,
    env = 'prod',
  } = params

  log(`Swap ${amount} ${sellToken} for ${buyToken} on chain ${chainId}`)

  const signer = typeof params.signer === 'string' ? new ethers.Wallet(params.signer) : params.signer
  const orderBookApi = new OrderBookApi({ chainId, env })

  const from = await signer.getAddress()
  const receiver = params.receiver || from
  const isSell = kind === 'sell'

  log('Building app data...')

  const appDataInfo = await buildAppData(
    {
      slippageBps,
      orderClass: 'market',
      appCode,
    },
    advancedSettings?.appData
  )

  const { appDataKeccak256, fullAppData } = appDataInfo

  const quoteRequest: OrderQuoteRequest = {
    from,
    sellToken,
    buyToken,
    receiver,
    validFor,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
    priceQuality: PriceQuality.OPTIMAL,
    signingScheme: SigningScheme.EIP712,
    ...(isSell
      ? { kind: OrderQuoteSideKindSell.SELL, sellAmountBeforeFee: amount }
      : { kind: OrderQuoteSideKindBuy.BUY, buyAmountAfterFee: amount }),
    ...advancedSettings?.quoteRequest,
  }

  log('Getting quote...')

  const quoteResponse = await orderBookApi.getQuote(quoteRequest)

  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams: quoteResponse.quote,
    slippagePercentBps: slippageBps,
    partnerFeeBps: partnerFee?.bps,
    sellDecimals: sellTokenDecimals,
    buyDecimals: buyTokenDecimals,
  })

  return { amountsAndCosts, quoteResponse, appDataInfo, orderBookApi, signer }
}
