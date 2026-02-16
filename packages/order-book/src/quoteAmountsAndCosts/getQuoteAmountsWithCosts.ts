import { OrderKind, OrderParameters } from '../generated'
import { getBigNumber } from './quoteAmountsAndCosts.utils'
import { getProtocolFeeAmount } from './getProtocolFeeAmount'
import { getQuoteAmountsWithNetworkCosts } from './getQuoteAmountsWithNetworkCosts'

export function getQuoteAmountsWithCosts(params: {
  sellDecimals: number
  buyDecimals: number
  orderParams: OrderParameters
  protocolFeeBps?: number
}) {
  const { sellDecimals, buyDecimals, orderParams, protocolFeeBps = 0 } = params

  const isSell = orderParams.kind === OrderKind.SELL

  const protocolFeeAmount = getProtocolFeeAmount({ orderParams, isSell, protocolFeeBps })
  const protocolFeeAmountDecimals = isSell ? buyDecimals : sellDecimals

  const {
    sellAmountAfterNetworkCosts,
    buyAmountAfterNetworkCosts,
    buyAmountBeforeNetworkCosts,
    networkCostAmount,
    quotePrice,
    sellAmountBeforeNetworkCosts,
  } = getQuoteAmountsWithNetworkCosts({
    sellDecimals,
    buyDecimals,
    orderParams,
    protocolFeeAmount: getBigNumber(protocolFeeAmount, protocolFeeAmountDecimals),
    isSell,
  })

  return {
    isSell,
    quotePrice,
    networkCostAmount: networkCostAmount.big,
    sellAmountBeforeNetworkCosts: sellAmountBeforeNetworkCosts.big,
    sellAmountAfterNetworkCosts: sellAmountAfterNetworkCosts.big,
    buyAmountAfterNetworkCosts: buyAmountAfterNetworkCosts.big,
    buyAmountBeforeNetworkCosts: buyAmountBeforeNetworkCosts.big,
  }
}
