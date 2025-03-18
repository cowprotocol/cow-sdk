import { QuoteResults, QuoterParameters, SwapAdvancedSettings, SwapParameters, TradeParameters } from './types'
import { DEFAULT_QUOTE_VALIDITY, DEFAULT_SLIPPAGE_BPS, log } from './consts'

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
import { Signer } from 'ethers'
import { getOrderTypedData } from './getOrderTypedData'
import { getSigner } from '../common/utils/wallet'
import { AccountAddress } from 'src/common'

// ETH-FLOW orders require different quote params
// check the isEthFlow flag and set in quote req obj
const ETH_FLOW_AUX_QUOTE_PARAMS = {
  signingScheme: SigningScheme.EIP1271,
  onchainOrder: true,
  // Ethflow orders are subsidized in the backend.
  // This means we can assume the verification gas costs are zero for the quote/fee estimation
  verificationGasLimit: 0,
}

export type QuoteResultsWithSigner = { result: QuoteResults & { signer: Signer }; orderBookApi: OrderBookApi }

export async function getQuote(
  _tradeParameters: TradeParameters,
  trader: QuoterParameters,
  advancedSettings?: SwapAdvancedSettings,
  _orderBookApi?: OrderBookApi
): Promise<{ result: QuoteResults; orderBookApi: OrderBookApi }> {
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
    sellTokenDecimals,
    buyToken,
    buyTokenDecimals,
    amount,
    kind,
    partnerFee,
    validFor = DEFAULT_QUOTE_VALIDITY,
    slippageBps = DEFAULT_SLIPPAGE_BPS,
    env = 'prod',
  } = tradeParameters

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
      partnerFee,
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
    priceQuality: PriceQuality.OPTIMAL, // Do not change this parameter because we rely on the fact that quote has id
    signingScheme: SigningScheme.EIP712,
    ...(isEthFlow ? ETH_FLOW_AUX_QUOTE_PARAMS : {}),
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    swapParamsToLimitOrderParams(tradeParameters, quoteResponse),
    appDataInfo.appDataKeccak256
  )

  const orderTypedData = await getOrderTypedData(chainId, orderToSign)

  return {
    result: {
      tradeParameters,
      amountsAndCosts,
      orderToSign,
      quoteResponse,
      appDataInfo,
      orderTypedData,
    },
    orderBookApi,
  }
}

export async function getQuoteWithSigner(
  swapParameters: SwapParameters,
  advancedSettings?: SwapAdvancedSettings,
  orderBookApi?: OrderBookApi
): Promise<QuoteResultsWithSigner> {
  const signer = getSigner(swapParameters.signer)
  const account = swapParameters.owner || ((await signer.getAddress()) as AccountAddress)

  const trader: QuoterParameters = {
    chainId: swapParameters.chainId,
    appCode: swapParameters.appCode,
    account,
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
