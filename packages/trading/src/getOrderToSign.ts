import {
  BuyTokenDestination,
  getQuoteAmountsAndCosts,
  type OrderParameters,
  SellTokenSource,
} from '@cowprotocol/sdk-order-book'
import { UnsignedOrder } from '@cowprotocol/sdk-order-signing'
import { DEFAULT_QUOTE_VALIDITY } from './consts'
import { LimitTradeParameters } from './types'
import { getPartnerFeeBps } from './utils/getPartnerFeeBps'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { getDefaultSlippageBps } from './utils/slippage'
import { getOrderDeadlineFromNow } from './utils/order'

interface OrderToSignParams {
  chainId: SupportedChainId
  isEthFlow: boolean
  from: string
  networkCostsAmount?: string
  applyQuoteAdjustments?: boolean
}

export function getOrderToSign(
  { chainId, from, networkCostsAmount = '0', isEthFlow, applyQuoteAdjustments = true }: OrderToSignParams,
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
    slippageBps = getDefaultSlippageBps(chainId, isEthFlow),
    partnerFee,
    validFor = DEFAULT_QUOTE_VALIDITY,
  } = limitOrderParams

  const receiver = limitOrderParams.receiver || from
  const validTo = limitOrderParams.validTo || Number(getOrderDeadlineFromNow(validFor))

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

  let sellAmountToUse = sellAmount
  let buyAmountToUse = buyAmount

  if (applyQuoteAdjustments) {
    const { afterSlippage } = getQuoteAmountsAndCosts({
      orderParams,
      slippagePercentBps: slippageBps,
      partnerFeeBps: getPartnerFeeBps(partnerFee),
      sellDecimals: sellTokenDecimals,
      buyDecimals: buyTokenDecimals,
    })
    sellAmountToUse = afterSlippage.sellAmount.toString()
    buyAmountToUse = afterSlippage.buyAmount.toString()
  }

  return {
    sellToken,
    buyToken,
    sellAmount: sellAmountToUse,
    buyAmount: buyAmountToUse,
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
