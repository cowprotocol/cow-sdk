import {
  AccountAddress,
  QuoteResults,
  QuoterParameters,
  SwapAdvancedSettings,
  SwapParameters,
  TradeParameters,
} from './types'
import { DEFAULT_QUOTE_VALIDITY, log } from './consts'

import {
  getQuoteAmountsAndCosts,
  OrderBookApi,
  OrderQuoteRequest,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  SigningScheme,
} from '../order-book'
import { buildAppData } from './appDataUtils'
import { getOrderToSign } from './getOrderToSign'
import { getIsEthFlowOrder, getSigner, swapParamsToLimitOrderParams } from './utils'
import { Signer } from 'ethers'
import { WRAPPED_NATIVE_CURRENCIES } from '../common'
import { getOrderTypedData } from './getOrderTypedData'

export type QuoteResultsWithSigner = { result: QuoteResults & { signer: Signer }; orderBookApi: OrderBookApi }

export async function getQuote(
  tradeParameters: TradeParameters,
  trader: QuoterParameters,
  advancedSettings?: SwapAdvancedSettings,
  _orderBookApi?: OrderBookApi
): Promise<{ result: QuoteResults; orderBookApi: OrderBookApi }> {
  const {
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
  } = tradeParameters

  const { appCode, chainId, account: from } = trader

  log(`Swap ${amount} ${sellToken} for ${buyToken} on chain ${chainId}`)

  const orderBookApi = _orderBookApi || new OrderBookApi({ chainId, env })

  const receiver = tradeParameters.receiver || from
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
    sellToken: getIsEthFlowOrder(tradeParameters) ? WRAPPED_NATIVE_CURRENCIES[chainId] : sellToken,
    buyToken,
    receiver,
    validFor,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
    priceQuality: PriceQuality.OPTIMAL, // Do not change this parameter because we rely on the fact that quote has id
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

  const orderToSign = getOrderToSign(
    { from, networkCostsAmount: quoteResponse.quote.feeAmount },
    swapParamsToLimitOrderParams(tradeParameters, quoteResponse),
    appDataInfo.appDataKeccak256
  )

  const orderTypedData = await getOrderTypedData(chainId, orderToSign)

  return {
    result: { amountsAndCosts, quoteResponse, appDataInfo, orderToSign, tradeParameters, orderTypedData },
    orderBookApi,
  }
}

export async function getQuoteWithSigner(
  swapParameters: SwapParameters,
  advancedSettings?: SwapAdvancedSettings,
  orderBookApi?: OrderBookApi
): Promise<QuoteResultsWithSigner> {
  const signer = getSigner(swapParameters.signer)

  const trader = {
    chainId: swapParameters.chainId,
    appCode: swapParameters.appCode,
    account: (await signer.getAddress()) as AccountAddress,
  }

  const result = await getQuote(swapParameters, trader, advancedSettings, orderBookApi)

  return {
    result: {
      ...result.result,
      signer,
    },
    orderBookApi: result.orderBookApi,
  }
}
