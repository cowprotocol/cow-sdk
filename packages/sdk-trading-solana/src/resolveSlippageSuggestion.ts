import { SupportedChainId } from '@cowprotocol/sdk-config'
import { bpsToPercentage, log, suggestSlippageBps } from '@cowprotocol/sdk-common'
import { getQuoteAmountsAndCosts, PriceQuality } from '@cowprotocol/sdk-order-book'
import { OrderKind, QuoteResponse } from '@cowprotocol/sdk-order-book/solana'
import type { SwapAdvancedSettings } from '@cowprotocol/sdk-trading'

export interface ResolveSolanaSlippageSuggestionParams {
  sellToken: string
  buyToken: string
  priceQuality: PriceQuality
  quoteResponse: QuoteResponse
  advancedSettings?: SwapAdvancedSettings
}

/**
 * Solana counterpart to the EVM SDK's `resolveSlippageSuggestion`. Reuses the same fee+volume heuristic
 * (`@cowprotocol/sdk-common`'s `suggestSlippageBps`) and the same `advancedSettings.getSlippageSuggestion`
 * override hook, falling back to the default suggestion for a `FAST` quote, a missing callback, a `null`
 * result, or an error thrown by the callback itself.
 */
export async function resolveSolanaSlippageSuggestion(params: ResolveSolanaSlippageSuggestionParams): Promise<number> {
  const { sellToken, buyToken, priceQuality, quoteResponse, advancedSettings } = params

  const defaultSuggestion = defaultSlippageSuggestion(quoteResponse)
  const getSlippageSuggestion = advancedSettings?.getSlippageSuggestion

  if (priceQuality === PriceQuality.FAST || !getSlippageSuggestion) {
    return defaultSuggestion
  }

  // slippagePercentBps is 0 here because we only need amounts after partner fees to pass to getSlippageSuggestion()
  // protocolFeeBps is absent from the response and fixed at zero: no Solana component charges a fee
  const { isSell, beforeAllFees, afterSlippage } = getQuoteAmountsAndCosts({
    orderParams: quoteResponse.quote,
    slippagePercentBps: 0,
    partnerFeeBps: undefined,
    protocolFeeBps: undefined,
  })

  try {
    const suggestedSlippage = await getSlippageSuggestion({
      chainId: SupportedChainId.SOLANA,
      sellToken,
      buyToken,
      sellAmount: isSell ? beforeAllFees.sellAmount : afterSlippage.sellAmount,
      buyAmount: isSell ? afterSlippage.buyAmount : beforeAllFees.buyAmount,
    })

    const suggestedSlippageBps = suggestedSlippage.slippageBps

    return suggestedSlippageBps
      ? defaultSlippageSuggestion(quoteResponse, bpsToPercentage(suggestedSlippageBps))
      : defaultSuggestion
  } catch (e: unknown) {
    log(`getSlippageSuggestion() error: ${(e as Error).message || String(e)}`)
    return defaultSuggestion
  }
}

/** Extracts what `suggestSlippageBps` needs from a quote response and runs the shared fee+volume
 * heuristic — Solana has no eth-flow concept, so it never passes a `lowerCapBps`. */
function defaultSlippageSuggestion(quoteResponse: QuoteResponse, volumeMultiplierPercent?: number): number {
  const isSell = quoteResponse.quote.kind === OrderKind.SELL
  const {
    beforeNetworkCosts: { sellAmount: sellAmountBeforeNetworkCosts },
    afterNetworkCosts: { sellAmount: sellAmountAfterNetworkCosts },
  } = getQuoteAmountsAndCosts({
    orderParams: quoteResponse.quote,
    protocolFeeBps: 0,
    partnerFeeBps: undefined,
    slippagePercentBps: 0,
  })

  return suggestSlippageBps({
    isSell,
    feeAmount: BigInt(quoteResponse.quote.feeAmount),
    sellAmountBeforeNetworkCosts,
    sellAmountAfterNetworkCosts,
    volumeMultiplierPercent,
  })
}
