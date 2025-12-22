import { TTLCache } from '@cowprotocol/sdk-common'
import { TokenInfo } from '@cowprotocol/sdk-config'
import { TradingSdk } from '@cowprotocol/sdk-trading'

import { getQuoteWithBridge } from '../getQuoteWithBridge'
import { GetQuoteWithBridgeParams } from '../types'
import { createBridgeRequestTimeoutPromise } from '../utils'
import { MultiQuoteContext, MultiQuoteResult } from '../../types'

export async function fetchMultiQuote(
  context: MultiQuoteContext,
  tradingSdk: TradingSdk,
  intermediateTokensCache?: TTLCache<TokenInfo[]>,
): Promise<MultiQuoteResult | undefined> {
  const { provider, quoteBridgeRequest, advancedSettings, providerTimeout } = context

  const supportedNetworks = await provider.getNetworks()
  const destinationNetwork = supportedNetworks.find((i) => i.id === quoteBridgeRequest.buyTokenChainId)

  // Do not make a request if a provider doesn't support the network
  if (!destinationNetwork) return

  const baseParams: GetQuoteWithBridgeParams = {
    swapAndBridgeRequest: quoteBridgeRequest,
    advancedSettings,
    tradingSdk,
    quoteSigner: advancedSettings?.quoteSigner,
  } as const

  const request = intermediateTokensCache
    ? {
        ...baseParams,
        intermediateTokensCache: intermediateTokensCache,
      }
    : baseParams

  // Race between the actual quote request and the provider timeout
  const quote = await Promise.race([
    getQuoteWithBridge(provider, request),
    createBridgeRequestTimeoutPromise(providerTimeout, `Provider ${provider.info.dappId}`),
  ])

  return {
    providerDappId: provider.info.dappId,
    quote,
    error: undefined,
  }
}
