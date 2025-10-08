import { SupportedChainId } from '@cowprotocol/sdk-config'
import { bpsToPercentage, log } from '@cowprotocol/sdk-common'
import { getQuoteAmountsAndCosts, OrderQuoteResponse, PriceQuality } from '@cowprotocol/sdk-order-book'

import { QuoterParameters, SlippageToleranceResponse, SwapAdvancedSettings, TradeParameters } from './types'
import { suggestSlippageBps, SuggestSlippageBps } from './suggestSlippageBps'
import { getPartnerFeeBps } from './utils/getPartnerFeeBps'

export async function resolveSlippageSuggestion(
  chainId: SupportedChainId,
  tradeParameters: TradeParameters,
  trader: QuoterParameters,
  quote: OrderQuoteResponse,
  isEthFlow: boolean,
  advancedSettings?: SwapAdvancedSettings,
): Promise<SlippageToleranceResponse> {
  const suggestSlippageParams: SuggestSlippageBps = {
    isEthFlow,
    quote,
    tradeParameters,
    trader,
    advancedSettings,
  }
  const getSlippageSuggestion = advancedSettings?.getSlippageSuggestion

  const priceQuality = advancedSettings?.quoteRequest?.priceQuality ?? PriceQuality.OPTIMAL

  const defaultSuggestion = suggestSlippageBps(suggestSlippageParams)

  if (priceQuality === PriceQuality.FAST || !getSlippageSuggestion) {
    return { slippageBps: defaultSuggestion }
  }

  // slippagePercentBps is 0 here because we only need amounts after partnerFees to pass it to getSlippageSuggestion()
  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams: quote.quote,
    slippagePercentBps: 0,
    partnerFeeBps: getPartnerFeeBps(tradeParameters.partnerFee),
    sellDecimals: tradeParameters.sellTokenDecimals,
    buyDecimals: tradeParameters.buyTokenDecimals,
  })

  try {
    const suggestedSlippage = await getSlippageSuggestion({
      chainId,
      sellToken: tradeParameters.sellToken,
      buyToken: tradeParameters.buyToken,
      sellAmount: amountsAndCosts.afterSlippage.sellAmount,
      buyAmount: amountsAndCosts.afterSlippage.buyAmount,
    })

    const suggestedSlippageBps = suggestedSlippage.slippageBps

    return {
      slippageBps: suggestedSlippageBps
        ? suggestSlippageBps({
            ...suggestSlippageParams,
            volumeMultiplierPercent: bpsToPercentage(suggestedSlippageBps),
          })
        : defaultSuggestion,
    }
  } catch (e: unknown) {
    log(`getSlippageSuggestion() error: ${(e as Error).message || String(e)}`)
    return { slippageBps: defaultSuggestion }
  }
}
