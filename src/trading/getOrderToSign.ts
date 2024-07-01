import { getQuoteAmountsAndCosts, type OrderParameters } from '../order-book'
import { UnsignedOrder } from '../order-signing'
import { AppDataInfo, LimitOrderParameters } from './types'
import { DEFAULT_QUOTE_VALIDITY } from './consts'

export function getOrderToSign(from: string, params: LimitOrderParameters, appData: AppDataInfo): UnsignedOrder {
  const {
    sellAmount,
    buyAmount,
    sellToken,
    sellTokenDecimals,
    buyToken,
    buyTokenDecimals,
    kind,
    networkCostsAmount,
    partiallyFillable = false,
    slippageBps = 0,
    partnerFee,
    validFor,
  } = params

  const receiver = params.receiver || from
  const validTo = params.validTo || Math.floor(Date.now() / 1000) + (validFor || DEFAULT_QUOTE_VALIDITY)
  const { appDataKeccak256 } = appData

  const orderParams: OrderParameters = {
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    receiver,
    validTo,
    kind,
    feeAmount: networkCostsAmount,
    appData: appDataKeccak256,
    partiallyFillable,
  }

  const { afterSlippage } = getQuoteAmountsAndCosts({
    orderParams,
    slippagePercentBps: slippageBps,
    partnerFeeBps: partnerFee?.bps,
    sellDecimals: sellTokenDecimals,
    buyDecimals: buyTokenDecimals,
  })

  return {
    sellToken,
    buyToken,
    sellAmount: afterSlippage.sellAmount.toString(),
    buyAmount: afterSlippage.buyAmount.toString(),
    validTo,
    kind,
    partiallyFillable,
    appData: appDataKeccak256,
    receiver,
    feeAmount: '0',
  }
}
