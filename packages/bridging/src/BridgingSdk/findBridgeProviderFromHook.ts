import type { cowAppDataLatestScheme } from '@cowprotocol/sdk-app-data'
import { getPostHooks } from '../utils'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../const'
import type { BridgeProvider, BridgeQuoteResult } from '../types'

export function findBridgeProviderFromHook(
  fullAppData: string,
  providers: BridgeProvider<BridgeQuoteResult>[],
): BridgeProvider<BridgeQuoteResult> | undefined {
  const appDataObj = JSON.parse(fullAppData)
  let bridgeProviderDappId = (appDataObj as cowAppDataLatestScheme.AppDataRootSchema)?.metadata?.bridging?.providerId

  if (!bridgeProviderDappId) {
    const postHooks = getPostHooks(appDataObj)

    // Assuming we only have one bridging hook
    const bridgingHook = postHooks.find((hook) => {
      return hook.dappId?.startsWith(HOOK_DAPP_BRIDGE_PROVIDER_PREFIX)
    })

    if (!bridgingHook) {
      return undefined
    }
    // Bridge provider would be the last part of the dappId
    bridgeProviderDappId = bridgingHook.dappId
  }

  // Find the provider by name (note that I could just have use this.provider, but just wanted to leave it ready in case we implement multiple providers)
  return providers.find((provider) => provider.info.dappId === bridgeProviderDappId)
}
