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
}

export function getOrderToSign(
  { chainId, from, networkCostsAmount = '0', isEthFlow }: OrderToSignParams,
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
