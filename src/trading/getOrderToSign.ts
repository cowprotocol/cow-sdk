import { BuyTokenDestination, getQuoteAmountsAndCosts, type OrderParameters, SellTokenSource } from '../order-book'
import { UnsignedOrder } from '../order-signing'
import { DEFAULT_QUOTE_VALIDITY, DEFAULT_SLIPPAGE_BPS } from './consts'
import { LimitTradeParameters } from './types'
import { getPartnerFeeBps } from './utils/getPartnerFeeBps'

interface OrderToSignParams {
  from: string
  networkCostsAmount?: string
}

export function getOrderToSign(
  { from, networkCostsAmount = '0' }: OrderToSignParams,
  limitOrderParams: LimitTradeParameters,
  appDataKeccak256: string,
): UnsignedOrder {
  const {
    sellAmount,
    buyAmount,
    sellToken,
    sellTokenDecimals,
    buyToken,
    buyTokenDecimals,
    kind,
    partiallyFillable = false,
    slippageBps = DEFAULT_SLIPPAGE_BPS,
    partnerFee,
    validFor,
  } = limitOrderParams

  const receiver = limitOrderParams.receiver || from
  const validTo = limitOrderParams.validTo || Math.floor(Date.now() / 1000) + (validFor || DEFAULT_QUOTE_VALIDITY)

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
    partnerFeeBps: getPartnerFeeBps(partnerFee),
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
    sellTokenBalance: SellTokenSource.ERC20,
    buyTokenBalance: BuyTokenDestination.ERC20,
  }
}
