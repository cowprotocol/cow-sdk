import { log } from '@cowprotocol/sdk-common'
import { SuggestSlippageBps, suggestSlippageBps } from './suggestSlippageBps'
import { CoWBFFClient } from './cowBffClient'
import { getDefaultSlippageBps } from './utils/slippage'

const MAX_SLIPPAGE_BPS = 10_000 // 100% in BPS (max slippage)

export interface SuggestSlippageBpsWithApi extends SuggestSlippageBps {
  bffOrigin: string
  slippageApiTimeoutMs?: number
}

/**
 * Enhanced slippage suggestion that uses API slippage tolerance with fallback to existing logic
 *
 * This function:
 * 1. Attempts to get slippage tolerance from the API using the sellToken/buyToken pair
 * 2. Falls back to the existing suggestSlippageBps calculation if API fails
 * 3. Clamps the result between minimum (default) and maximum (100%) slippage
 *
 * @param params - Parameters including tokens, quote, optional BFF environment, and API timeout
 * @returns Suggested slippage in basis points
 */
export async function suggestSlippageBpsWithApi(params: SuggestSlippageBpsWithApi): Promise<number> {
  const { trader, isEthFlow, bffOrigin, slippageApiTimeoutMs } = params
  const { sellToken, buyToken } = params.quote.quote

  // Try to get slippage from API first
  try {
    const apiClient = new CoWBFFClient(bffOrigin)
    const apiResponse = await apiClient.getSlippageTolerance({
      sellToken,
      buyToken,
      chainId: trader.chainId,
      timeoutMs: slippageApiTimeoutMs,
    })

    if (apiResponse && typeof apiResponse.slippageBps === 'number') {
      const apiSlippageBps = apiResponse.slippageBps

      // Validate API response is reasonable (between min and max)
      const minSlippageBps = getDefaultSlippageBps(trader.chainId, isEthFlow)

      if (apiSlippageBps >= minSlippageBps && apiSlippageBps <= MAX_SLIPPAGE_BPS) {
        log(`Using API slippage tolerance: ${apiSlippageBps} BPS`)
        return apiSlippageBps
      } else {
        log(
          `API slippage tolerance ${apiSlippageBps} BPS is outside valid range [${minSlippageBps}, ${MAX_SLIPPAGE_BPS}], falling back to calculation`,
        )
      }
    }
  } catch (error) {
    log(
      `Failed to get slippage from API, falling back to calculation: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }

  // Fallback to existing calculation
  log('Falling back to existing slippage calculation')
  return suggestSlippageBps(params)
}
