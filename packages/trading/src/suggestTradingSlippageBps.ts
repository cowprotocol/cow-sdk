import { suggestSlippageBps } from '@cowprotocol/sdk-common'
import { getQuoteAmountsAndCosts, OrderKind, OrderQuoteResponse } from '@cowprotocol/sdk-order-book'

import { QuoterParameters, SwapAdvancedSettings, TradeParameters } from './types'
import { ETH_FLOW_DEFAULT_SLIPPAGE_BPS } from './consts'

export interface SuggestSlippageBps {
  tradeParameters: Pick<TradeParameters, 'sellTokenDecimals' | 'buyTokenDecimals'>
  isEthFlow: boolean
  quote: OrderQuoteResponse
  trader: QuoterParameters
  advancedSettings?: SwapAdvancedSettings
  volumeMultiplierPercent?: number
}

/**
 * Return the slippage in BPS that would allow the fee to increase by the multiplying factor percent.
 *
 * EVM-specific adapter around `@cowprotocol/sdk-common`'s `suggestSlippageBps`: extracts the amounts the
 * shared fee+volume heuristic needs from an `OrderQuoteResponse`, and supplies the eth-flow floor the
 * shared function has no notion of.
 */
export function suggestTradingSlippageBps(params: SuggestSlippageBps): number {
  const { quote, trader, isEthFlow, volumeMultiplierPercent } = params

  const isSell = quote.quote.kind === OrderKind.SELL
  // Calculate the amount of the sell token before and after network costs
  const {
    beforeNetworkCosts: { sellAmount: sellAmountBeforeNetworkCosts },
    afterNetworkCosts: { sellAmount: sellAmountAfterNetworkCosts },
  } = getQuoteAmountsAndCosts({
    orderParams: quote.quote,
    protocolFeeBps: quote.protocolFeeBps ? Number(quote.protocolFeeBps) : 0,
    partnerFeeBps: undefined,
    slippagePercentBps: 0,
  })

  return suggestSlippageBps({
    isSell,
    feeAmount: BigInt(quote.quote.feeAmount),
    sellAmountBeforeNetworkCosts,
    sellAmountAfterNetworkCosts,
    lowerCapBps: isEthFlow ? ETH_FLOW_DEFAULT_SLIPPAGE_BPS[trader.chainId] : 0,
    volumeMultiplierPercent,
  })
}
