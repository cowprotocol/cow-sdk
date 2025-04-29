import { BridgeProvider, BridgeQuoteResult, BridgeStatus, CrossChainOrder } from '../types'
import { SupportedChainId } from '../../chains'
import { OrderBookApi } from 'src/order-book'
import { getPostHooks } from '../utils'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../providers/across/const/misc'
import { CowEnv } from '../../common'
import { providers } from 'ethers'
/**
 * Fetch a cross-chain order and its status.
 */
export async function getCrossChainOrder(params: {
  orderId: string
  chainId: SupportedChainId
  orderBookApi: OrderBookApi
  providers: BridgeProvider<BridgeQuoteResult>[]
  rpcProvider: providers.JsonRpcProvider
  env: CowEnv
}): Promise<CrossChainOrder> {
  const { orderId, chainId, orderBookApi, providers, rpcProvider, env } = params

  const chainContext = { chainId, env }
  const order = await orderBookApi.getOrder(orderId, chainContext)

  const postHooks = getPostHooks(order.fullAppData ?? undefined)

  // Assuming we only have one bridging hook
  const bridgingHook = postHooks.find((hook) => {
    return hook.dappId?.startsWith(HOOK_DAPP_BRIDGE_PROVIDER_PREFIX)
  })

  if (!bridgingHook) {
    throw new Error(`Order ${orderId} is not a cross-chain order`)
  }
  // Bridge provider would be the last part of the dappId
  const bridgeProviderName = bridgingHook.dappId?.split(HOOK_DAPP_BRIDGE_PROVIDER_PREFIX).pop()

  // Find the provider by name (note that I could just have use this.provider, but just wanted to leave it ready in case we implement multiple providers)
  const provider = providers.find((provider) => provider.info.name === bridgeProviderName)
  if (!provider) {
    throw new Error(
      `Unknown Bridge provider: ${bridgeProviderName}. Add provider to the SDK config to be able to decode the order`
    )
  }

  // TODO: We might want to decode the bridge appData (reverse the encoding of the call in the provider)
  //const bridgeDeposit = await provider.decodeBridgeHook(bridgingHook)

  // Check if there are any trades for this order
  const trades = await orderBookApi.getTrades({ orderUid: order.uid }, chainContext)
  if (trades.length > 0) {
    // Bridging already initiated
    const firstTrade = trades[0]
    if (!firstTrade.txHash) {
      // Shouldn't happen, but lets make typescript happy
      throw new Error(`No tx hash found for order ${orderId} . First trade, with log index ${firstTrade.logIndex}`)
    }

    // Get bridging id for this order
    const bridgingId = await provider.getBridgingId(chainId, orderId, firstTrade.txHash, rpcProvider)
    const { status, fillTimeInSeconds } = await provider.getStatus(bridgingId, chainId)
    const explorerUrl = provider.getExplorerUrl(bridgingId)

    return {
      chainId,
      order,
      status,
      bridgingId,
      explorerUrl,
      fillTimeInSeconds,
    }
  } else {
    // Bridging not initiated yet
    return {
      chainId,
      order,
      status: BridgeStatus.NOT_INITIATED,
    }
  }
}
