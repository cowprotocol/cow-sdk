import { getGlobalAdapter, log, AccountAddress, AbstractSigner } from '@cowprotocol/sdk-common'
import { DEFAULT_QUOTE_VALIDITY } from './consts'
import {
  TradingAppDataInfo,
  BuildAppDataParams,
  QuoteResults,
  QuoterParameters,
  SwapAdvancedSettings,
  SwapParameters,
  TradeParameters,
} from './types'

import {
  getQuoteAmountsAndCosts,
  OrderBookApi,
  OrderQuoteRequest,
  OrderQuoteResponse,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  SigningScheme,
} from '@cowprotocol/sdk-order-book'
import { buildAppData } from './appDataUtils'
import { getOrderToSign } from './getOrderToSign'
import { getOrderTypedData } from './getOrderTypedData'
import { getPartnerFeeBps } from './utils/getPartnerFeeBps'
import { adjustEthFlowOrderParams, getIsEthFlowOrder, swapParamsToLimitOrderParams } from './utils/misc'
import { getDefaultSlippageBps } from './utils/slippage'
import { resolveSlippageSuggestion } from './resolveSlippageSuggestion'
import { resolveSigner } from './utils/resolveSigner'

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
  result: QuoteResults & { signer: AbstractSigner<unknown> }
  orderBookApi: OrderBookApi
}

interface GetQuoteRawResult {
  isEthFlow: boolean
  quote: OrderQuoteResponse
  appDataInfo: TradingAppDataInfo
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

  const tradeParameters = isEthFlow ? adjustEthFlowOrderParams(chainId, _tradeParameters) : _tradeParameters

  const {
    sellToken,
    buyToken,
    amount,
    kind,
    partnerFee,
    validFor = DEFAULT_QUOTE_VALIDITY,
    validTo,
    slippageBps,
    env = 'prod',
  } = tradeParameters

  // Validate that both validFor and validTo are not provided at the same time
  if (validTo !== undefined && tradeParameters.validFor !== undefined) {
    throw new Error('Cannot specify both validFor and validTo. Use validFor for relative time or validTo for absolute time.')
  }

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
  const defaultSlippageBps = getDefaultSlippageBps(chainId, isEthFlow)
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
    ...(validTo !== undefined ? { validTo } : { validFor }),
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
  const { slippageBps: suggestedSlippageBps } = await resolveSlippageSuggestion(
    chainId,
    tradeParameters,
    trader,
    quote,
    isEthFlow,
    advancedSettings,
  )

  const commonResult = {
    isEthFlow,
    quote,
    orderBookApi,
    suggestedSlippageBps: suggestedSlippageBps || defaultSlippageBps,
  }

  // If no slippage is specified. AUTO slippage is used
  if (slippageBps === undefined) {
    if (suggestedSlippageBps) {
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
        ...commonResult,
        appDataInfo: newAppDataInfo,
        tradeParameters: { ..._tradeParameters, slippageBps: suggestedSlippageBps },
        slippageBps: suggestedSlippageBps,
      }
    } else {
      log(`No suggested slippage. Using the default slippage (${defaultSlippageBps} BPS)`)
    }
  }

  return {
    ...commonResult,
    appDataInfo,
    // Return the original tradeParameters to not expose all intermediate changes
    tradeParameters: _tradeParameters,
    slippageBps: slippageBpsOrDefault,
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

export async function getTrader(swapParameters: SwapParameters): Promise<QuoterParameters> {
  const signer = getGlobalAdapter().signerOrNull()
  const account = swapParameters.owner || ((await signer?.getAddress()) as AccountAddress)

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
  const signer = resolveSigner(swapParameters.signer)

  const trader = await getTrader(swapParameters)
  const result = await getQuote(swapParameters, trader, advancedSettings, orderBookApi)

  return {
    result: {
      ...result.result,
      signer,
    },
    orderBookApi: result.orderBookApi,
  }
}
