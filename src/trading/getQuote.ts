import { log } from '../common/utils/log'
import { DEFAULT_QUOTE_VALIDITY } from './consts'
import {
  AppDataInfo,
  BuildAppDataParams,
  QuoteResults,
  QuoterParameters,
  SwapAdvancedSettings,
  SwapParameters,
  TradeParameters,
} from './types'

import { Signer } from '@ethersproject/abstract-signer'
import { AccountAddress } from '../common/types/wallets'
import { getSigner } from '../common/utils/wallet'
import {
  getQuoteAmountsAndCosts,
  OrderBookApi,
  OrderQuoteRequest,
  OrderQuoteResponse,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  SigningScheme,
} from '../order-book'
import { buildAppData } from './appDataUtils'
import { getOrderToSign } from './getOrderToSign'
import { getOrderTypedData } from './getOrderTypedData'
import { suggestSlippageBps } from './suggestSlippageBps'
import { getPartnerFeeBps } from './utils/getPartnerFeeBps'
import { getIsEthFlowOrder, swapParamsToLimitOrderParams } from './utils/misc'
import { getDefaultSlippageBps } from './utils/slippage'
import { WRAPPED_NATIVE_CURRENCIES } from '../common'

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

interface GetQuoteRawResult {
  isEthFlow: boolean
  quote: OrderQuoteResponse
  appDataInfo: AppDataInfo
  orderBookApi: OrderBookApi
  tradeParameters: TradeParameters
  slippageBps: number
  suggestedSlippageBps: number
}

export async function getQuoteRaw(
  _tradeParameters: TradeParameters,
  trader: QuoterParameters,
  advancedSettings?: SwapAdvancedSettings,
  _orderBookApi?: OrderBookApi,
): Promise<GetQuoteRawResult> {
  const { appCode, chainId, account: from } = trader
  const isEthFlow = getIsEthFlowOrder(_tradeParameters)

  const tradeParameters = isEthFlow
    ? {
        ..._tradeParameters,
        sellToken: WRAPPED_NATIVE_CURRENCIES[chainId].address,
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
      slippageBps !== undefined ? `${slippageBps} BPS` : 'AUTO'
    } slippage`,
  )

  const orderBookApi = _orderBookApi || new OrderBookApi({ chainId, env })

  const receiver = tradeParameters.receiver || from
  const isSell = kind === 'sell'

  log('Building app data...')

  // If slippageBps is undefined, we use the default slippage
  const defaultSlippageBps = getDefaultSlippageBps(chainId, _tradeParameters.sellToken)
  const slippageBpsOrDefault = slippageBps ?? defaultSlippageBps

  const buildAppDataParams: BuildAppDataParams = {
    slippageBps: slippageBpsOrDefault,
    orderClass: 'market',
    appCode,
    partnerFee,
  }
  const appDataInfo = await buildAppData(buildAppDataParams, advancedSettings?.appData)

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

  // Get the suggested slippage based on the quote
  const suggestedSlippageBps = suggestSlippageBps({
    isEthFlow,
    quote,
    tradeParameters,
    trader,
    advancedSettings,
  })

  // If no slippage is specified. AUTO slippage is used
  if (slippageBps === undefined) {
    // If suggested slippage is greater than default, we use the suggested slippage
    if (suggestedSlippageBps > defaultSlippageBps) {
      // Recursive call, this time using the suggested slippage
      log(
        `Suggested slippage is greater than ${defaultSlippageBps} BPS (default), using the suggested slippage (${suggestedSlippageBps} BPS)`,
      )

      const newAppDataInfo = await buildAppData(
        {
          ...buildAppDataParams,
          slippageBps: suggestedSlippageBps,
        },
        advancedSettings?.appData,
      )
      log(
        `App data with new suggested slippage: appDataKeccak256=${newAppDataInfo.appDataKeccak256} fullAppData=${newAppDataInfo.fullAppData}`,
      )

      return {
        isEthFlow,
        slippageBps: suggestedSlippageBps,
        suggestedSlippageBps,
        tradeParameters: { ..._tradeParameters, slippageBps: suggestedSlippageBps },
        appDataInfo: newAppDataInfo,

        // We reuse the quote, because the slippage has no fundamental impact on the quote
        quote,
        orderBookApi,
      }
    } else {
      log(
        `Suggested slippage is only ${suggestedSlippageBps} BPS. Using the default slippage (${defaultSlippageBps} BPS)`,
      )
    }
  }

  return {
    isEthFlow,
    quote,
    appDataInfo,
    orderBookApi,
    tradeParameters,
    slippageBps: slippageBpsOrDefault,
    suggestedSlippageBps,
  }
}

export async function getQuote(
  _tradeParameters: TradeParameters,
  trader: QuoterParameters,
  advancedSettings?: SwapAdvancedSettings,
  _orderBookApi?: OrderBookApi,
): Promise<{ result: QuoteResults; orderBookApi: OrderBookApi }> {
  const { quote, orderBookApi, tradeParameters, slippageBps, suggestedSlippageBps, appDataInfo, isEthFlow } =
    await getQuoteRaw(_tradeParameters, trader, advancedSettings, _orderBookApi)

  const { partnerFee, sellTokenDecimals, buyTokenDecimals } = tradeParameters
  const { chainId, account: from } = trader

  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams: quote.quote,
    slippagePercentBps: slippageBps,
    partnerFeeBps: getPartnerFeeBps(partnerFee),
    sellDecimals: sellTokenDecimals,
    buyDecimals: buyTokenDecimals,
  })

  const orderToSign = getOrderToSign(
    { chainId, from, networkCostsAmount: quote.quote.feeAmount, isEthFlow },
    swapParamsToLimitOrderParams(tradeParameters, quote),
    appDataInfo.appDataKeccak256,
  )

  const orderTypedData = await getOrderTypedData(chainId, orderToSign)

  return {
    result: {
      tradeParameters,
      suggestedSlippageBps,
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
  orderBookApi?: OrderBookApi,
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
