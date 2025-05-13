import { QuoteResults, QuoterParameters, SwapAdvancedSettings, SwapParameters, TradeParameters } from './types'
import { DEFAULT_QUOTE_VALIDITY, DEFAULT_SLIPPAGE_BPS } from './consts'
import { log } from '../common/utils/log'

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
import { adjustEthFlowOrderParams, getIsEthFlowOrder, swapParamsToLimitOrderParams } from './utils'
import { Signer } from '@ethersproject/abstract-signer'
import { getOrderTypedData } from './getOrderTypedData'
import { getSigner } from '../common/utils/wallet'
import { AccountAddress } from '../common/types/wallets'
import { suggestSlippageBps } from './getSuggestedSlippage'

// ETH-FLOW orders require different quote params
// check the isEthFlow flag and set in quote req obj
const ETH_FLOW_AUX_QUOTE_PARAMS = {
  signingScheme: SigningScheme.EIP1271,
  onchainOrder: true,
  // Ethflow orders are subsidized in the backend.
  // This means we can assume the verification gas costs are zero for the quote/fee estimation
  verificationGasLimit: 0,
}

export type QuoteResultsWithSigner = {
  result: QuoteResults & { signer: Signer }
  orderBookApi: OrderBookApi
}

export async function getQuoteRaw(
  _tradeParameters: TradeParameters,
  trader: QuoterParameters,
  advancedSettings?: SwapAdvancedSettings,
  _orderBookApi?: OrderBookApi
) {
  const { appCode, chainId, account: from } = trader
  const isEthFlow = getIsEthFlowOrder(_tradeParameters)

  const tradeParameters = isEthFlow
    ? {
        ..._tradeParameters,
        ...adjustEthFlowOrderParams(chainId, _tradeParameters),
      }
    : _tradeParameters

  const {
    sellToken,
    buyToken,
    amount,
    kind,
    partnerFee,
    validFor = DEFAULT_QUOTE_VALIDITY,
    slippageBps,
    env = 'prod',
  } = tradeParameters

  log(
    `getQuote for: Swap ${amount} ${sellToken} for ${buyToken} on chain ${chainId} with ${
      slippageBps ? slippageBps + ' BPS' : 'AUTO'
    } slippage`
  )

  const orderBookApi = _orderBookApi || new OrderBookApi({ chainId, env })

  const receiver = tradeParameters.receiver || from
  const isSell = kind === 'sell'

  log('Building app data...')

  const slippageBpsToUse = slippageBps ?? DEFAULT_SLIPPAGE_BPS

  const appDataInfo = await buildAppData(
    {
      slippageBps: slippageBpsToUse,
      orderClass: 'market',
      appCode,
      partnerFee,
    },
    advancedSettings?.appData
  )

  const { appDataKeccak256, fullAppData } = appDataInfo
  log(`App data: appDataKeccak256=${appDataKeccak256} fullAppData=${fullAppData}`)

  const quoteRequest: OrderQuoteRequest = {
    from,
    sellToken,
    buyToken,
    receiver,
    validFor,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
    priceQuality: PriceQuality.OPTIMAL, // Do not change this parameter because we rely on the fact that quote has id
    signingScheme: SigningScheme.EIP712,
    ...(isEthFlow ? ETH_FLOW_AUX_QUOTE_PARAMS : {}),
    ...(isSell
      ? { kind: OrderQuoteSideKindSell.SELL, sellAmountBeforeFee: amount }
      : { kind: OrderQuoteSideKindBuy.BUY, buyAmountAfterFee: amount }),
    ...advancedSettings?.quoteRequest,
  }

  log('Getting quote...')

  const quote = await orderBookApi.getQuote(quoteRequest)

  return {
    quote,
    appDataInfo,
    orderBookApi,
    tradeParameters,
    slippageBpsToUse,
  }
}

export async function getQuote(
  _tradeParameters: TradeParameters,
  trader: QuoterParameters,
  advancedSettings?: SwapAdvancedSettings,
  _orderBookApi?: OrderBookApi
): Promise<{ result: QuoteResults; orderBookApi: OrderBookApi }> {
  const { quote, orderBookApi, tradeParameters, slippageBpsToUse, appDataInfo } = await getQuoteRaw(
    _tradeParameters,
    trader,
    advancedSettings,
    _orderBookApi
  )
  const { partnerFee, slippageBps, sellTokenDecimals, buyTokenDecimals } = tradeParameters
  const { chainId, account: from } = trader

  // If AUTO slippage is used, we need to calculate the suggested slippage based on the quote)
  if (slippageBps === undefined) {
    const suggestedSlippageBps = suggestSlippageBps({ quote, tradeParameters, trader, advancedSettings })

    // If suggested slippage is greater than default, we use the suggested slippage
    if (suggestedSlippageBps > DEFAULT_SLIPPAGE_BPS) {
      // Recursive call, this time using the suggested slippage
      log(
        `Suggested slippage is greater than ${DEFAULT_SLIPPAGE_BPS} BPS (default), calling getQuote again with suggested slippage=${suggestedSlippageBps}`
      )
      const newTradeParameters = { ..._tradeParameters, slippageBps: suggestedSlippageBps }
      return getQuote(newTradeParameters, trader, advancedSettings, orderBookApi)
    } else {
      log(
        `Suggested slippage is only ${suggestedSlippageBps} BPS. Using the default slippage (${DEFAULT_SLIPPAGE_BPS} BPS)`
      )
    }
  }

  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams: quote.quote,
    slippagePercentBps: slippageBpsToUse,
    partnerFeeBps: partnerFee?.bps,
    sellDecimals: sellTokenDecimals,
    buyDecimals: buyTokenDecimals,
  })

  const orderToSign = getOrderToSign(
    { from, networkCostsAmount: quote.quote.feeAmount },
    swapParamsToLimitOrderParams(tradeParameters, quote),
    appDataInfo.appDataKeccak256
  )

  const orderTypedData = await getOrderTypedData(chainId, orderToSign)

  return {
    result: {
      tradeParameters,
      amountsAndCosts,
      orderToSign,
      quoteResponse: quote,
      appDataInfo,
      orderTypedData,
    },
    orderBookApi,
  }
}

export async function getTrader(signer: Signer, swapParameters: SwapParameters): Promise<QuoterParameters> {
  const account = swapParameters.owner || ((await signer.getAddress()) as AccountAddress)

  return {
    chainId: swapParameters.chainId,
    appCode: swapParameters.appCode,
    account,
  }
}

export async function getQuoteWithSigner(
  swapParameters: SwapParameters,
  advancedSettings?: SwapAdvancedSettings,
  orderBookApi?: OrderBookApi
): Promise<QuoteResultsWithSigner> {
  const signer = getSigner(swapParameters.signer)
  const trader = await getTrader(signer, swapParameters)
  const result = await getQuote(swapParameters, trader, advancedSettings, orderBookApi)

  return {
    result: {
      ...result.result,
      signer,
    },
    orderBookApi: result.orderBookApi,
  }
}
