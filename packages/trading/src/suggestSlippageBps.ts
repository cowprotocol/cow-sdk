import { percentageToBps } from '@cowprotocol/sdk-common'
import { getQuoteAmountsWithNetworkCosts, OrderKind, OrderQuoteResponse } from '@cowprotocol/sdk-order-book'

import { getSlippagePercent } from './utils/slippage'
import { suggestSlippageFromFee } from './suggestSlippageFromFee'
import { suggestSlippageFromVolume } from './suggestSlippageFromVolume'
import { QuoterParameters, SwapAdvancedSettings, TradeParameters } from './types'
import { ETH_FLOW_DEFAULT_SLIPPAGE_BPS } from './consts'

const MAX_SLIPPAGE_BPS = 10_000 // 100% in BPS (max slippage)

const SLIPPAGE_FEE_MULTIPLIER_PERCENT = 50 // Account for 50% fee increase
const SLIPPAGE_VOLUME_MULTIPLIER_PERCENT = 0.5 // Account for 0.5% volume as slippage

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
 */
export function suggestSlippageBps(params: SuggestSlippageBps): number {
  const {
    quote,
    tradeParameters,
    trader,
    isEthFlow,
    volumeMultiplierPercent = SLIPPAGE_VOLUME_MULTIPLIER_PERCENT,
  } = params
  const { sellTokenDecimals, buyTokenDecimals } = tradeParameters

  const isSell = quote.quote.kind === OrderKind.SELL
  // Calculate the amount of the sell token before and after network costs
  const {
    sellAmountBeforeNetworkCosts,
    sellAmountAfterNetworkCosts,
  } = getQuoteAmountsWithNetworkCosts({
    sellDecimals: sellTokenDecimals,
    buyDecimals: buyTokenDecimals,
    orderParams: quote.quote,
    protocolFeeBps: quote.protocolFeeBps ? Number(quote.protocolFeeBps) : 0,
  })

  const { feeAmount: feeAmountString } = quote.quote
  const feeAmount = BigInt(feeAmountString)

  // Account for some slippage due to the fee increase
  const slippageBpsFromFee = suggestSlippageFromFee({
    feeAmount,
    multiplyingFactorPercent: SLIPPAGE_FEE_MULTIPLIER_PERCENT,
  })

  // Account for some slippage due to price change (volume slippage)
  const slippageBpsFromVolume = suggestSlippageFromVolume({
    isSell,
    sellAmountBeforeNetworkCosts,
    sellAmountAfterNetworkCosts,
    slippagePercent: volumeMultiplierPercent,
  })

  // Aggregate all slippages
  const totalSlippageBps = slippageBpsFromFee + slippageBpsFromVolume

  // Get percentage slippage
  const slippagePercent = getSlippagePercent({
    isSell,
    sellAmountBeforeNetworkCosts,
    sellAmountAfterNetworkCosts,
    slippage: totalSlippageBps,
  })

  // Convert to BPS
  const slippageBps = percentageToBps(slippagePercent)

  const lowerCap = isEthFlow ? ETH_FLOW_DEFAULT_SLIPPAGE_BPS[trader.chainId] : 0

  // Clamp slippage to min/max
  return Math.max(Math.min(slippageBps, MAX_SLIPPAGE_BPS), lowerCap)
}
