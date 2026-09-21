import { SupportedChainId } from '@cowprotocol/sdk-config'
import { bpsToPercentage, log, suggestSlippageBps } from '@cowprotocol/sdk-common'
import { getQuoteAmountsAndCosts, OrderKind, OrderQuoteResponse, PriceQuality } from '@cowprotocol/sdk-order-book'
import type { SwapAdvancedSettings } from '@cowprotocol/sdk-trading'

export interface ResolveSolanaSlippageSuggestionParams {
  sellToken: string
  buyToken: string
  priceQuality: PriceQuality
  quoteResponse: OrderQuoteResponse
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
  const { isSell, beforeAllFees, afterSlippage } = getQuoteAmountsAndCosts({
    orderParams: quoteResponse.quote,
    slippagePercentBps: 0,
    partnerFeeBps: undefined,
    protocolFeeBps: quoteResponse.protocolFeeBps ? Number(quoteResponse.protocolFeeBps) : undefined,
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
function defaultSlippageSuggestion(quoteResponse: OrderQuoteResponse, volumeMultiplierPercent?: number): number {
  const isSell = quoteResponse.quote.kind === OrderKind.SELL
  const {
    beforeNetworkCosts: { sellAmount: sellAmountBeforeNetworkCosts },
    afterNetworkCosts: { sellAmount: sellAmountAfterNetworkCosts },
  } = getQuoteAmountsAndCosts({
    orderParams: quoteResponse.quote,
    protocolFeeBps: quoteResponse.protocolFeeBps ? Number(quoteResponse.protocolFeeBps) : 0,
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
